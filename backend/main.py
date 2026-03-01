import os
import json
import base64
import shutil
import uuid
import asyncio
from pathlib import Path
from typing import Optional, List

import numpy as np
from PIL import Image
from io import BytesIO

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import tensorflow as tf
from ultralytics import YOLO

load_dotenv()

app = FastAPI(title="GreenWaste AI Pipeline")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

MODEL_PATH = Path(__file__).parent.parent / "best_model.keras"
YOLO_MODEL_PATH = Path(__file__).parent.parent / "waste_yolo26seg_best.pt"
CLASS_NAMES = ["Hazardous", "Non-Recyclable", "Organic", "Recyclable"]

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_MIME = {"image/jpeg", "image/jpg", "image/png", "image/webp"}

groq_client: Optional[Groq] = None
tf_model: Optional[tf.keras.Model] = None
yolo_model: Optional[YOLO] = None

# ══════════════════════════════════════════════════════════════
# YOLO LABEL → CATEGORY MAPPING
# ══════════════════════════════════════════════════════════════

HAZARDOUS_LABELS = {"batteries", "e-waste", "paints", "pesticides"}
NON_RECYCLABLE_LABELS = {"ceramic_product", "diapers", "platics_bags_wrappers", "sanitary_napkin", "stroform_product"}
ORGANIC_LABELS = {"coffee_tea_bags", "egg_shells", "food_scraps", "kitchen_waste", "yard_trimmings"}
RECYCLABLE_LABELS = {"cans_all_type", "glass_containers", "paper_products", "plastic_bottles"}


def get_groq_client() -> Groq:
    global groq_client
    if groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not set")
        groq_client = Groq(api_key=api_key)
    return groq_client


def get_tf_model() -> tf.keras.Model:
    global tf_model
    if tf_model is None:
        if not MODEL_PATH.exists():
            raise HTTPException(status_code=500, detail=f"Model not found at {MODEL_PATH}")
        tf_model = tf.keras.models.load_model(str(MODEL_PATH))
    return tf_model


def get_yolo_model() -> YOLO:
    global yolo_model
    if yolo_model is None:
        if not YOLO_MODEL_PATH.exists():
            raise HTTPException(status_code=500, detail=f"YOLO model not found at {YOLO_MODEL_PATH}")
        yolo_model = YOLO(str(YOLO_MODEL_PATH))
    return yolo_model


STAGE1_SYSTEM_PROMPT = """You are an image validation AI for a waste segregation system.

Your job is NOT general description.
Your job is STRICT filtering.

You must determine whether the uploaded image is a valid garbage/waste photo suitable for waste classification.

---

## VALID GARBAGE IMAGE DEFINITION

A valid garbage image contains discarded, unwanted material intended for disposal.

Examples of VALID garbage:

* food waste
* leftovers
* fruit peels
* vegetable waste
* plastic bottles
* packaging
* wrappers
* paper trash
* cardboard
* garbage bins
* landfill waste
* mixed household trash
* broken objects meant to be thrown away
* electronic waste (chargers, wires, batteries)
* sanitary waste

---

## INVALID IMAGE (MUST BE REJECTED)

If ANY of the following are present as the main subject, the image is NOT garbage:

Living beings:

* humans
* faces
* hands holding camera
* animals
* birds
* pets
* insects

Non-waste scenes:

* landscapes
* buildings
* vehicles
* furniture in use
* kitchen food on a plate ready to eat
* grocery items in store
* fruits or vegetables that are fresh and not discarded
* selfies
* group photos
* documents
* screens
* memes
* drawings

Ambiguous cases:
A person holding a bottle → NOT garbage
A person eating food → NOT garbage
A dog near a trash can → NOT garbage

IMPORTANT:
If a living being is visible anywhere in the image → REJECT.

---

## OUTPUT RULES (CRITICAL)

You MUST respond ONLY with strict JSON.
No sentences.
No explanation.
No markdown.

Return exactly:

{
"is_garbage": true/false,
"confidence": 0.00,
"reason": "short reason"
}

---

## DECISION LOGIC

Return is_garbage = true ONLY if:

* the main subject is discarded waste
* and no living being is visible

Return is_garbage = false if:

* any human, animal, or living organism appears
* or image is unrelated to waste

If uncertain → set is_garbage to false and confidence below 0.60.

Confidence scale:
0.90–0.99 → very clear waste
0.70–0.89 → probable waste
0.50–0.69 → uncertain
<0.50 → reject

You are a safety filter, not a chat assistant.
Never describe the image beyond the short reason field."""


# ══════════════════════════════════════════════════════════════
# GROQ VISUAL LOCALIZATION PROMPT
# ══════════════════════════════════════════════════════════════
GROQ_LOCALIZE_PROMPT = """You are a computer vision object localization AI.

Your task: identify up to 8 distinct waste or garbage objects visible in the image and return their approximate positions as bounding boxes in normalized coordinates (0.0 to 1.0, relative to image width/height).

Return ONLY strict JSON like this:
{
  "objects": [
    {"label": "plastic bottle", "x1": 0.10, "y1": 0.20, "x2": 0.35, "y2": 0.70},
    {"label": "cardboard box", "x1": 0.50, "y1": 0.10, "x2": 0.90, "y2": 0.60}
  ]
}

Rules:
- x1, y1 = top-left corner (0.0 to 1.0)
- x2, y2 = bottom-right corner (0.0 to 1.0)
- Labels must be short, human-readable (2-4 words max)
- Only include objects you can clearly see
- Maximum 8 objects
- If no objects visible, return {"objects": []}
- NO explanation, NO markdown, ONLY JSON"""

STAGE3_SYSTEM_PROMPT = """You are an environmental sustainability analysis AI.

The image has already been confirmed as garbage.

Your job is to generate environmental insights based on the waste photo.

You are assisting a smart waste management platform used by schools and municipalities.

---

## INPUT YOU WILL RECEIVE

1. The image
2. Predicted category from classifier:
   Organic | Recyclable | Hazardous | Non-Recyclable

---

## YOUR TASKS

1. Briefly identify likely waste items visible.
2. Explain correct disposal method.
3. Explain environmental impact.
4. Estimate environmental harm if thrown in landfill.
5. Provide sustainability advice to the user.

Keep response structured and factual.

---

## OUTPUT FORMAT (STRICT JSON)

Return:

{
"detected_items": ["item1","item2"],
"disposal_method": "",
"environmental_impact": "",
"landfill_risk": "",
"user_advice": ""
}

---

## RULES

Keep each text field under 40 words.
Do not use emojis.
Do not use conversational tone.
Do not ask questions.
Do not include markdown.
Do not repeat category names.

Focus on educational sustainability explanation suitable for a dashboard."""


MIXED_INSIGHTS_PROMPT = """You are an environmental sustainability analysis AI.

The image contains mixed or contaminated waste that requires segregation.

---

## INPUT

1. The image
2. Materials detected: {materials}
3. Contamination status: {contaminated}
4. Final category: {final_category}

---

## YOUR TASKS

1. Explain the correct disposal method for this mixed/contaminated waste.
2. Explain why segregation is important for these specific materials.
3. Provide actionable user advice.

---

## OUTPUT FORMAT (STRICT JSON)

Return:

{
"detected_items": ["item1", "item2"],
"disposal_method": "",
"environmental_impact": "",
"landfill_risk": "",
"user_advice": ""
}

---

## RULES

- Keep each text field under 40 words.
- For mixed waste: emphasize segregation requirement.
- For contaminated recyclables: explain contamination impact.
- No emojis, no markdown, no conversational tone.
- Respond ONLY with JSON.
"""


def parse_json_response(text: str) -> dict:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    return json.loads(text)


async def call_groq_vision(system_prompt: str, user_text: str, image_b64: str, mime_type: str) -> dict:
    client = get_groq_client()
    data_url = f"data:{mime_type};base64,{image_b64}"

    try:
        response = await asyncio.to_thread(
            client.chat.completions.create,
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_text},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                },
            ],
            temperature=0.1,
            max_tokens=1024,
        )
        content = response.choices[0].message.content
        return parse_json_response(content)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"Groq returned invalid JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq API error: {str(e)}")


def run_tf_prediction(image_bytes: bytes) -> dict:
    try:
        model = get_tf_model()
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        img = img.resize((224, 224))
        img_array = np.array(img, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        predictions = model.predict(img_array, verbose=0)
        predicted_index = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][predicted_index])
        all_probs = {CLASS_NAMES[i]: round(float(predictions[0][i]), 4) for i in range(len(CLASS_NAMES))}
        return {
            "class": CLASS_NAMES[predicted_index],
            "confidence": round(confidence, 4),
            "all_probabilities": all_probs,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TensorFlow model error: {str(e)}")


# ══════════════════════════════════════════════════════════════
# YOLO DETECTION
# ══════════════════════════════════════════════════════════════

def run_yolo_detection(image_path: str) -> list:
    """Run YOLO model on an image and return detected objects."""
    try:
        model = get_yolo_model()
        results = model(image_path, verbose=False)
        objects = []
        for r in results:
            boxes = r.boxes
            if boxes is None:
                continue
            for i in range(len(boxes)):
                label_idx = int(boxes.cls[i].item())
                label = model.names.get(label_idx, f"class_{label_idx}")
                conf = round(float(boxes.conf[i].item()), 4)
                bbox = [round(float(c), 2) for c in boxes.xyxy[i].tolist()]
                objects.append({
                    "label": label,
                    "confidence": conf,
                    "bbox": bbox,
                })
        return objects
    except Exception:
        return []


# ══════════════════════════════════════════════════════════════
# OBJECT-BASED CLASSIFICATION RULES
# ══════════════════════════════════════════════════════════════

def determine_category_from_objects(objects: list) -> str:
    """
    Rule engine: map detected YOLO objects → waste category.

    Priority:
    1. Any hazardous label → "Hazardous"
    2. Both organic AND recyclable present → "Mixed Waste"
    3. Only organic → "Organic"
    4. Only recyclable → "Recyclable"
    5. Only non-recyclable → "Non-Recyclable"
    6. Mix of non-recyclable + others → use dominant
    7. Unknown labels → "Non-Recyclable"
    """
    labels = {obj["label"] for obj in objects}

    has_hazardous = bool(labels & HAZARDOUS_LABELS)
    has_organic = bool(labels & ORGANIC_LABELS)
    has_recyclable = bool(labels & RECYCLABLE_LABELS)
    has_non_recyclable = bool(labels & NON_RECYCLABLE_LABELS)

    # Rule 1: hazardous takes priority
    if has_hazardous:
        return "Hazardous"

    # Rule 2: both organic and recyclable → mixed
    if has_organic and has_recyclable:
        return "Mixed Waste"

    # Rule 3-4-5: single type
    if has_organic and not has_recyclable and not has_non_recyclable:
        return "Organic"

    if has_recyclable and not has_organic and not has_non_recyclable:
        return "Recyclable"

    if has_non_recyclable and not has_organic and not has_recyclable:
        return "Non-Recyclable"

    # Organic + non-recyclable
    if has_organic and has_non_recyclable:
        return "Mixed Waste"

    # Recyclable + non-recyclable
    if has_recyclable and has_non_recyclable:
        return "Mixed Waste"

    # Fallback: labels exist but do not match any known set
    return "Non-Recyclable"


# ══════════════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════════════

@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    """Standalone YOLO detection endpoint."""
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")

    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    temp_filename = f"{uuid.uuid4().hex}.{ext}"
    temp_path = UPLOAD_DIR / temp_filename

    try:
        with open(temp_path, "wb") as f:
            f.write(file_bytes)

        objects = run_yolo_detection(str(temp_path))
        return JSONResponse(status_code=200, content={
            "objects": objects,
            "total_objects": len(objects),
        })
    finally:
        if temp_path.exists():
            temp_path.unlink()


@app.post("/analyze")
async def analyze_waste(file: UploadFile = File(...)):
    # --- Validate MIME type ---
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}. Allowed: jpeg, jpg, png, webp")

    # --- Read and validate file size ---
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large: {len(file_bytes)} bytes. Max 5MB allowed.")

    # --- Save file temporarily ---
    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    temp_filename = f"{uuid.uuid4().hex}.{ext}"
    temp_path = UPLOAD_DIR / temp_filename

    try:
        with open(temp_path, "wb") as f:
            f.write(file_bytes)

        # --- Get image dimensions ---
        img_pil = Image.open(BytesIO(file_bytes))
        image_width, image_height = img_pil.size

        # --- Base64 encode ---
        image_b64 = base64.b64encode(file_bytes).decode("utf-8")
        mime_type = file.content_type or "image/jpeg"

        # ═══════════ STAGE 1: Vision Gatekeeper ═══════════
        stage1_result = await call_groq_vision(
            system_prompt=STAGE1_SYSTEM_PROMPT,
            user_text="Analyze this image. Is it a valid garbage/waste image?",
            image_b64=image_b64,
            mime_type=mime_type,
        )

        is_garbage = stage1_result.get("is_garbage", False)
        if not is_garbage:
            return JSONResponse(
                status_code=400,
                content={
                    "status": "rejected",
                    "message": "Uploaded image is not a garbage/waste image",
                    "reason": stage1_result.get("reason", "Unknown"),
                },
            )

        # ═══════════ STAGE 2: YOLO Object Detection (PRIMARY) ═══════════
        detected_objects = run_yolo_detection(str(temp_path))
        analysis_source = "yolo"
        final_category = ""
        ml_support = {"category": "", "confidence": 0.0}

        if len(detected_objects) > 0:
            # YOLO detected objects → use rule engine
            final_category = determine_category_from_objects(detected_objects)

            # Optionally call TF for supporting confidence
            try:
                tf_result = run_tf_prediction(file_bytes)
                ml_support = {
                    "category": tf_result["class"],
                    "confidence": tf_result["confidence"],
                }
            except Exception:
                ml_support = {"category": "", "confidence": 0.0}
        else:
            # ═══════════ FALLBACK: TensorFlow Classifier ═══════════
            analysis_source = "ml_fallback"
            try:
                tf_result = run_tf_prediction(file_bytes)
                final_category = tf_result["class"]
                ml_support = {
                    "category": tf_result["class"],
                    "confidence": tf_result["confidence"],
                }
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Both YOLO and ML failed: {str(e)}")

        # ═══════════ STAGE 3: Environmental Insights (Groq) ═══════════
        object_labels = [o["label"] for o in detected_objects]
        insights = None
        try:
            if final_category in ("Mixed Waste",):
                prompt = MIXED_INSIGHTS_PROMPT.replace("{materials}", ", ".join(object_labels))
                prompt = prompt.replace("{contaminated}", "true" if len(set(object_labels)) > 1 else "false")
                prompt = prompt.replace("{final_category}", final_category)
                insights_result = await call_groq_vision(
                    system_prompt=prompt,
                    user_text=f"Analyze this waste image. Final category: {final_category}. Detected objects: {', '.join(object_labels)}. Provide disposal and environmental insights.",
                    image_b64=image_b64,
                    mime_type=mime_type,
                )
            else:
                insights_result = await call_groq_vision(
                    system_prompt=STAGE3_SYSTEM_PROMPT,
                    user_text=f"Analyze this waste image. The predicted waste category is: {final_category}. Detected objects: {', '.join(object_labels) if object_labels else 'none detected by object model'}. Provide environmental insights.",
                    image_b64=image_b64,
                    mime_type=mime_type,
                )
            insights = {
                "detected_items": insights_result.get("detected_items", []),
                "disposal_method": insights_result.get("disposal_method", ""),
                "environmental_impact": insights_result.get("environmental_impact", ""),
                "landfill_risk": insights_result.get("landfill_risk", ""),
                "user_advice": insights_result.get("user_advice", ""),
            }
        except Exception:
            insights = None

        # ═══════════ STAGE 4: Groq Visual Object Localization ═══════════
        groq_objects = []
        try:
            localize_result = await call_groq_vision(
                system_prompt=GROQ_LOCALIZE_PROMPT,
                user_text="Identify all waste objects in this image with their approximate bounding box positions.",
                image_b64=image_b64,
                mime_type=mime_type,
            )
            raw_objs = localize_result.get("objects", [])
            for obj in raw_objs:
                if all(k in obj for k in ("label", "x1", "y1", "x2", "y2")):
                    groq_objects.append({
                        "label": str(obj["label"]),
                        "x1": max(0.0, min(1.0, float(obj["x1"]))),
                        "y1": max(0.0, min(1.0, float(obj["y1"]))),
                        "x2": max(0.0, min(1.0, float(obj["x2"]))),
                        "y2": max(0.0, min(1.0, float(obj["y2"]))),
                    })
        except Exception:
            groq_objects = []

        # ═══════════ Final Response ═══════════
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "analysis_source": analysis_source,
                "final_category": final_category,
                "detected_objects": detected_objects,
                "ml_support": ml_support,
                "insights": insights,
                "image_width": image_width,
                "image_height": image_height,
                "groq_objects": groq_objects,
            },
        )

    finally:
        # --- Cleanup temp file ---
        if temp_path.exists():
            temp_path.unlink()


@app.post("/predict")
async def predict_only(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}")
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")
    result = run_tf_prediction(file_bytes)
    return JSONResponse(status_code=200, content=result)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "tf_model_loaded": tf_model is not None,
        "yolo_model_loaded": yolo_model is not None,
    }


CHAT_SYSTEM_PROMPT = """You are WasteOS AI, an expert waste management assistant embedded in a smart waste segregation platform.

You have already analyzed the user's uploaded waste image. You know:
- The final waste category (determined by YOLO object detection or ML fallback)
- The analysis source (yolo or ml_fallback)
- The detected objects and their labels
- The ML support classification (secondary confidence)
- The disposal method
- The environmental impact
- The landfill risk

Use this context to answer the user's questions helpfully and accurately.

RULES:
- Be concise (under 80 words per response).
- Be factual and educational.
- Do not use emojis.
- If asked about recycling centers, provide general guidance.
- If asked about CO2 savings, estimate based on the waste type.
- Reference the specific detected objects when relevant.
- Do not hallucinate data. If unsure, say so.
- Do not repeat the full analysis; answer the specific question asked.
- When YOLO detected objects, reference them by label name.
"""


class ChatRequest(BaseModel):
    message: str
    image_b64: str
    mime_type: str = "image/jpeg"
    classification: dict = {}
    insights: dict = {}
    final_category: str = ""
    analysis_source: str = "yolo"
    detected_objects: list = []
    ml_support: dict = {}
    history: List[dict] = []


@app.post("/chat")
async def chat_with_context(req: ChatRequest):
    client = get_groq_client()

    final_cat = req.final_category or req.classification.get("category", "Unknown")
    source_label = "YOLO object detection" if req.analysis_source == "yolo" else "ML classifier (fallback)"
    obj_labels = [o.get("label", "") for o in req.detected_objects] if req.detected_objects else []
    obj_str = ", ".join(obj_labels) if obj_labels else "N/A"
    ml_cat = req.ml_support.get("category", "N/A")
    ml_conf = req.ml_support.get("confidence", 0)

    context_summary = (
        f"Final waste category: {final_cat}. "
        f"Analysis source: {source_label}. "
        f"Detected objects: {obj_str}. "
        f"ML support: {ml_cat} ({ml_conf:.1%} confidence). "
        f"Detected items: {', '.join(req.insights.get('detected_items', []))}. "
        f"Disposal: {req.insights.get('disposal_method', 'N/A')}. "
        f"Environmental impact: {req.insights.get('environmental_impact', 'N/A')}. "
        f"Landfill risk: {req.insights.get('landfill_risk', 'N/A')}. "
        f"Advice: {req.insights.get('user_advice', 'N/A')}."
    )

    data_url = f"data:{req.mime_type};base64,{req.image_b64}"

    messages = [
        {"role": "system", "content": CHAT_SYSTEM_PROMPT + f"\n\nANALYSIS CONTEXT:\n{context_summary}"},
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "This is the waste image I uploaded for analysis."},
                {"type": "image_url", "image_url": {"url": data_url}},
            ],
        },
        {
            "role": "assistant",
            "content": f"I have analyzed your waste image. Final category: {final_cat} (via {source_label}). Detected objects: {obj_str}. ML support: {ml_cat} ({ml_conf:.1%}). How can I help you with this waste?",
        },
    ]

    # Append conversation history
    for msg in req.history:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("text", "")})

    # Append current user message
    messages.append({"role": "user", "content": req.message})

    try:
        response = await asyncio.to_thread(
            client.chat.completions.create,
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=messages,
            temperature=0.4,
            max_tokens=512,
        )
        reply = response.choices[0].message.content
        return JSONResponse(status_code=200, content={"message": reply})
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq chat error: {str(e)}")
