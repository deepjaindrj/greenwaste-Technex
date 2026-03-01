import { useState, useCallback, useRef } from "react";
import { Camera, Upload, Cpu, FileText, Check, Loader2, Send, Download, Share2, ArrowRight, X, RefreshCw, AlertTriangle } from "lucide-react";
import { analyzeWasteImage, AnalyzeSuccessResponse, getChatResponse } from "@/lib/api";

type Step = 'capture' | 'camera' | 'analyzing' | 'results' | 'rejected';

const suggestedQuestions = ["How to recycle this?", "Nearest recycling center?", "CO₂ savings if recycled?"];

const CATEGORY_COLORS: Record<string, string> = {
  Organic: "#F59E0B",
  Recyclable: "#16A34A",
  Hazardous: "#EF4444",
  "Non-Recyclable": "#6B7280",
};

export default function Scan() {
  const [step, setStep] = useState<Step>('capture');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSuccessResponse | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [imageB64, setImageB64] = useState("");
  const [imageMime, setImageMime] = useState("image/jpeg");
  const [currentAnalysisStage, setCurrentAnalysisStage] = useState(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("File too large. Maximum size is 5MB.");
        return;
      }
      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
        setErrorMessage("Invalid file type. Allowed: JPG, PNG, WEBP.");
        return;
      }
      setErrorMessage("");
      setImageFile(file);
      setImageMime(file.type || "image/jpeg");
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setImagePreview(dataUrl);
        // Extract base64 portion for chat context
        const b64 = dataUrl.split(",")[1] || "";
        setImageB64(b64);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const openCamera = useCallback(() => {
    setStep('camera');
  }, []);

  const captureFromCamera = useCallback(() => {
    setImagePreview('/placeholder.svg');
    setStep('capture');
  }, []);

  const startAnalysis = useCallback(async () => {
    if (!imageFile) return;
    setStep('analyzing');
    setProgress(0);
    setCurrentAnalysisStage(0);
    setErrorMessage("");
    setAnalysisResult(null);
    setRejectionReason("");

    let prog = 0;
    const interval = setInterval(() => {
      prog += 1;
      if (prog > 95) {
        clearInterval(interval);
        return;
      }
      setProgress(prog);
      if (prog > 20) setCurrentAnalysisStage(1);
      if (prog > 50) setCurrentAnalysisStage(2);
      if (prog > 75) setCurrentAnalysisStage(3);
    }, 150);
    progressIntervalRef.current = interval;

    try {
      const result = await analyzeWasteImage(imageFile);

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      if (result.status === "rejected") {
        setProgress(100);
        setRejectionReason(result.reason);
        setTimeout(() => setStep('rejected'), 300);
        return;
      }

      setAnalysisResult(result as AnalyzeSuccessResponse);
      setProgress(100);
      setCurrentAnalysisStage(4);
      setTimeout(() => setStep('results'), 400);
    } catch (err: any) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setErrorMessage(err.message || "Analysis failed. Please try again.");
      setStep('capture');
    }
  }, [imageFile]);

  const sendChat = useCallback(async (msg: string) => {
    if (!msg.trim() || !analysisResult || !imageB64) return;
    const newUserMsg = { role: 'user' as const, text: msg };
    setMessages(prev => [...prev, newUserMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      // Pass previous messages as history (exclude the current one)
      const history = [...messages, newUserMsg].map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', text: m.text }));
      const res = await getChatResponse(
        msg,
        imageB64,
        imageMime,
        analysisResult.classification,
        analysisResult.insights,
        history.slice(0, -1) // exclude current msg since backend appends it
      );
      setMessages(prev => [...prev, { role: 'ai', text: res.message }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't process that request." }]);
    }
    setChatLoading(false);
  }, [analysisResult, imageB64, imageMime, messages]);

  const resetScan = useCallback(() => {
    setStep('capture');
    setImagePreview(null);
    setImageFile(null);
    setMessages([]);
    setAnalysisResult(null);
    setRejectionReason("");
    setErrorMessage("");
    setImageB64("");
    setImageMime("image/jpeg");
    setProgress(0);
    setCurrentAnalysisStage(0);
  }, []);

  const analysisSteps = [
    { label: 'Validating image with AI Vision...', done: currentAnalysisStage > 0 },
    { label: 'Image confirmed as waste — running classifier...', done: currentAnalysisStage > 1 },
    { label: 'TensorFlow model prediction complete', done: currentAnalysisStage > 2 },
    { label: 'Generating environmental insights...', done: currentAnalysisStage > 3 },
    { label: 'Pipeline complete', done: currentAnalysisStage >= 4 },
  ];

  const currentStepIndex = step === 'capture' || step === 'camera' ? 0 : step === 'analyzing' ? 1 : 2;

  return (
    <div className="max-w-4xl mx-auto space-y-6 stagger-fade-in">
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">AI Waste Scanner</h1>
        <p className="text-sm text-muted-foreground">Scan, analyze, and get instant disposal recommendations</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-0">
        {[
          { label: 'Capture', icon: Camera, stepIdx: 0 },
          { label: 'Analyze', icon: Cpu, stepIdx: 1 },
          { label: 'Report', icon: FileText, stepIdx: 2 },
        ].map((s, i) => {
          const isCurrent = currentStepIndex === i;
          const isDone = currentStepIndex > i;
          return (
            <div key={s.label} className="flex items-center">
              {i > 0 && <div className={`w-16 h-0.5 ${isDone || isCurrent ? 'bg-primary' : 'bg-border'}`} />}
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDone ? 'bg-primary text-primary-foreground' : isCurrent ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {isDone ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className={`text-xs font-medium ${isCurrent || isDone ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{errorMessage}</p>
          <button onClick={() => setErrorMessage("")} className="ml-auto"><X className="w-4 h-4 text-destructive" /></button>
        </div>
      )}

      {/* CAMERA VIEWFINDER */}
      {step === 'camera' && (
        <div className="card-premium p-6">
          <div className="relative w-full rounded-2xl overflow-hidden bg-[#0F172A]" style={{ aspectRatio: '16/9' }}>
            <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#22C55E] z-10" />
            <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#22C55E] z-10" />
            <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#22C55E] z-10" />
            <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#22C55E] z-10" />
            <div className="absolute left-[8%] right-[8%] h-0.5 bg-primary/70 z-10" style={{ animation: 'cameraScanner 2s ease-in-out infinite', boxShadow: '0 0 12px rgba(34,197,94,0.5)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-3 h-3 rounded-full bg-primary pulse-glow" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="w-12 h-12 text-white/10" />
            </div>
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/90 text-white text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE SCAN
            </div>
            <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-white/10 text-white/70 text-[10px] font-mono">
              AI Pipeline Ready
            </div>
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm px-4 py-2.5 text-center">
              <p className="text-white/80 text-xs">Point at waste object to detect</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mt-5">
            <button onClick={captureFromCamera} className="btn-primary-gradient text-white px-8 py-3 rounded-full text-sm font-medium flex items-center gap-2">
              Capture
            </button>
            <button className="btn-secondary px-5 py-3 rounded-full text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Switch Camera
            </button>
            <button onClick={() => setStep('capture')} className="px-5 py-3 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
          <style>{`
            @keyframes cameraScanner {
              0% { top: 8%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 92%; opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* CAPTURE */}
      {step === 'capture' && (
        <div className="card-premium p-8">
          {!imagePreview ? (
            <div className="border-2 border-dashed border-primary/20 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary-glow flex items-center justify-center mb-4 pulse-glow">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-display font-medium text-foreground mb-1">Point camera at waste or drag an image here</p>
              <p className="text-sm text-muted-foreground mb-6">Supports JPG, PNG, WEBP - Max 5MB</p>
              <div className="flex gap-3">
                <button onClick={openCamera} className="btn-primary-gradient text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Open Camera
                </button>
                <label className="btn-secondary px-6 py-2.5 rounded-full text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload Image
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden">
                <img src={imagePreview} alt="Captured waste" className="w-full max-h-96 object-cover rounded-2xl" />
                <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">Image Captured</span>
              </div>
              <div className="flex justify-center gap-3">
                <button onClick={startAnalysis} className="btn-primary-gradient text-primary-foreground px-8 py-3 rounded-full text-sm font-medium flex items-center gap-2 shimmer" style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, #22C55E 0%, #16A34A 25%, #10B981 50%, #16A34A 75%, #22C55E 100%)' }}>
                  Analyze with AI Pipeline
                </button>
                <button onClick={resetScan} className="btn-secondary px-5 py-3 rounded-full text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Re-upload
                </button>
              </div>
              <p className="text-center text-xs text-muted-foreground">3-stage AI pipeline: Groq Vision + TensorFlow + Sustainability Insights</p>
            </div>
          )}
        </div>
      )}

      {/* ANALYZING */}
      {step === 'analyzing' && (
        <div className="card-premium p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {imagePreview && <img src={imagePreview} alt="Analyzing" className="rounded-2xl w-full object-cover max-h-72" />}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">Running AI Pipeline...</h3>
              {analysisSteps.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  {s.done ? <Check className="w-4 h-4 text-primary shrink-0" /> : currentAnalysisStage === i || (i === 0 && currentAnalysisStage === 0) ? <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" /> : <div className="w-4 h-4 rounded-full border border-border shrink-0" />}
                  <span className={s.done ? 'text-foreground' : currentAnalysisStage === i || (i === 0 && currentAnalysisStage === 0) ? 'text-foreground' : 'text-muted-foreground'}>{s.label}</span>
                </div>
              ))}
              <div className="w-full h-1 bg-surface rounded-full overflow-hidden mt-4">
                <div className="h-full progress-bar-gradient transition-all duration-100" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Processing through 3-stage pipeline...</p>
            </div>
          </div>
        </div>
      )}

      {/* REJECTED */}
      {step === 'rejected' && (
        <div className="card-premium p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-lg">Image Rejected</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              The uploaded image was not recognized as valid garbage or waste material by our AI Vision gatekeeper.
            </p>
            {rejectionReason && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3">
                <p className="text-sm text-destructive font-medium">Reason: {rejectionReason}</p>
              </div>
            )}
            {imagePreview && (
              <div className="relative rounded-2xl overflow-hidden max-w-xs">
                <img src={imagePreview} alt="Rejected" className="w-full object-cover rounded-2xl opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <X className="w-16 h-16 text-destructive/50" />
                </div>
              </div>
            )}
            <button onClick={resetScan} className="btn-primary-gradient text-primary-foreground px-8 py-3 rounded-full text-sm font-medium flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Try Another Image
            </button>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {step === 'results' && analysisResult && (
        <div className="space-y-6">
          <div className="card-premium p-5">
            <div className="relative rounded-2xl overflow-hidden bg-foreground/5 h-72 flex items-center justify-center">
              {imagePreview ? <img src={imagePreview} alt="Analyzed" className="w-full h-full object-cover" /> : <div className="text-muted-foreground text-sm">Analysis Complete</div>}
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: CATEGORY_COLORS[analysisResult.classification.category] || "#6B7280" }}>
                {analysisResult.classification.category} — {(analysisResult.classification.confidence * 100).toFixed(1)}%
              </div>
              <span className="absolute top-3 right-3 text-[10px] bg-card/80 backdrop-blur px-2 py-1 rounded-full text-muted-foreground font-mono">AI Pipeline Analysis</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-premium p-4 text-center">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="font-display font-semibold mt-1" style={{ color: CATEGORY_COLORS[analysisResult.classification.category] || "#6B7280" }}>{analysisResult.classification.category}</p>
            </div>
            <div className="card-premium p-4 text-center">
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="font-display font-semibold text-foreground mt-1">{(analysisResult.classification.confidence * 100).toFixed(1)}%</p>
            </div>
            <div className="card-premium p-4 text-center">
              <p className="text-xs text-muted-foreground">Detected Items</p>
              <p className="font-display font-semibold text-foreground mt-1 text-sm">{analysisResult.insights.detected_items.join(", ") || "—"}</p>
            </div>
            <div className="card-premium p-4 text-center">
              <p className="text-xs text-muted-foreground">Disposal</p>
              <p className="font-display font-semibold text-primary mt-1 text-sm">{analysisResult.insights.disposal_method || "—"}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-premium p-5 space-y-4">
              <h3 className="font-display font-semibold text-foreground">Environmental Insights</h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-secondary/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Environmental Impact</p>
                  <p className="text-sm text-foreground">{analysisResult.insights.environmental_impact || "—"}</p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                  <p className="text-[10px] uppercase tracking-wider text-destructive font-medium mb-1">Landfill Risk</p>
                  <p className="text-sm text-foreground">{analysisResult.insights.landfill_risk || "—"}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] uppercase tracking-wider text-primary font-medium mb-1">Advice</p>
                  <p className="text-sm text-foreground">{analysisResult.insights.user_advice || "—"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {analysisResult.insights.detected_items.map((item, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary">{item}</span>
                ))}
              </div>
            </div>

            <div className="card-premium p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Cpu className="w-3 h-3 text-primary-foreground" /></div>
                <h3 className="font-display font-semibold text-foreground">Ask WasteOS AI</h3>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {suggestedQuestions.map(q => (
                  <button key={q} onClick={() => sendChat(q)} className="text-[11px] px-3 py-1 rounded-full bg-primary-glow text-primary hover:bg-primary/10 transition-colors">{q}</button>
                ))}
              </div>
              <div className="flex-1 min-h-[160px] max-h-60 overflow-y-auto space-y-2 mb-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>{m.text}</div>
                  </div>
                ))}
                {chatLoading && <div className="flex justify-start"><div className="px-3 py-2 rounded-2xl bg-secondary text-xs text-muted-foreground">Typing...</div></div>}
              </div>
              <div className="flex gap-2">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat(chatInput)} placeholder="Ask about this waste..." className="flex-1 h-9 px-4 rounded-full bg-surface text-sm border-none outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={() => sendChat(chatInput)} className="w-9 h-9 rounded-full btn-primary-gradient flex items-center justify-center shrink-0"><Send className="w-3.5 h-3.5 text-primary-foreground" /></button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button className="btn-secondary px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"><Download className="w-4 h-4" /> Download Report PDF</button>
            <button className="px-5 py-2.5 rounded-full text-primary text-sm font-medium hover:bg-primary-glow transition-colors flex items-center gap-2"><Share2 className="w-4 h-4" /> Share Impact</button>
            <button onClick={resetScan} className="btn-primary-gradient text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2">Scan Another <ArrowRight className="w-4 h-4" /></button>
            <span className="px-4 py-2 rounded-full bg-primary-glow text-primary text-sm font-semibold animate-fade-in">+240 Green Points Earned!</span>
          </div>
        </div>
      )}
    </div>
  );
}