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
CLASS_NAMES = ["Hazardous", "Non-Recyclable", "Organic", "Recyclable"]

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_MIME = {"image/jpeg", "image/jpg", "image/png", "image/webp"}

groq_client: Optional[Groq] = None
tf_model: Optional[tf.keras.Model] = None


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
        return {
            "class": CLASS_NAMES[predicted_index],
            "confidence": round(confidence, 4),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TensorFlow model error: {str(e)}")


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

        # --- Base64 encode ---
        image_b64 = base64.b64encode(file_bytes).decode("utf-8")
        mime_type = file.content_type or "image/jpeg"

        # ========== STAGE 1: Vision Gatekeeper ==========
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

        # ========== STAGE 2: TensorFlow Classifier ==========
        tf_result = run_tf_prediction(file_bytes)

        # ========== STAGE 3: Environmental Insights ==========
        predicted_category = tf_result["class"]
        stage3_result = await call_groq_vision(
            system_prompt=STAGE3_SYSTEM_PROMPT,
            user_text=f"Analyze this waste image. The predicted waste category is: {predicted_category}. Provide environmental insights.",
            image_b64=image_b64,
            mime_type=mime_type,
        )

        # ========== Final Response ==========
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "classification": {
                    "category": tf_result["class"],
                    "confidence": tf_result["confidence"],
                },
                "insights": {
                    "detected_items": stage3_result.get("detected_items", []),
                    "disposal_method": stage3_result.get("disposal_method", ""),
                    "environmental_impact": stage3_result.get("environmental_impact", ""),
                    "landfill_risk": stage3_result.get("landfill_risk", ""),
                    "user_advice": stage3_result.get("user_advice", ""),
                },
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
    return {"status": "ok", "model_loaded": tf_model is not None}


CHAT_SYSTEM_PROMPT = """You are WasteOS AI, an expert waste management assistant embedded in a smart waste segregation platform.

You have already analyzed the user's uploaded waste image. You know:
- The waste classification category
- The confidence score
- The detected items
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
- Reference the specific waste items detected when relevant.
- Do not hallucinate data. If unsure, say so.
- Do not repeat the full analysis; answer the specific question asked.
"""


class ChatRequest(BaseModel):
    message: str
    image_b64: str
    mime_type: str = "image/jpeg"
    classification: dict = {}
    insights: dict = {}
    history: List[dict] = []


@app.post("/chat")
async def chat_with_context(req: ChatRequest):
    client = get_groq_client()

    context_summary = (
        f"Waste category: {req.classification.get('category', 'Unknown')}, "
        f"Confidence: {req.classification.get('confidence', 0):.1%}. "
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
            "content": f"I have analyzed your waste image. It was classified as {req.classification.get('category', 'Unknown')} with {req.classification.get('confidence', 0):.1%} confidence. Detected items: {', '.join(req.insights.get('detected_items', []))}. How can I help you with this waste?",
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
