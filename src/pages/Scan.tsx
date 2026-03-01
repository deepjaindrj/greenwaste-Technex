import { useState, useCallback, useRef, useEffect } from "react";
import { Camera, Upload, Cpu, FileText, Check, Loader2, Send, Download, Share2, ArrowRight, X, RefreshCw, AlertTriangle } from "lucide-react";
import { analyzeWasteImage, AnalyzeSuccessResponse, GroqObject, getChatResponse } from "@/lib/api";

type Step = 'capture' | 'camera' | 'analyzing' | 'results' | 'rejected';

const suggestedQuestions = ["How to recycle this?", "Nearest recycling center?", "CO₂ savings if recycled?"];

const CATEGORY_COLORS: Record<string, string> = {
  Organic: "#F59E0B",
  Recyclable: "#16A34A",
  Hazardous: "#EF4444",
  "Non-Recyclable": "#6B7280",
  "Mixed Waste": "#8B5CF6",
  "Contaminated Recyclable": "#F97316",
  "Segregation Required": "#EC4899",
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
  const [streamingText, setStreamingText] = useState("");
  const [streamingIdx, setStreamingIdx] = useState<number | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgLayout, setImgLayout] = useState({ offsetX: 0, offsetY: 0, scale: 1 });
  const [bboxesVisible, setBboxesVisible] = useState(false);
  const [hoveredBbox, setHoveredBbox] = useState<number | null>(null);
  const [groqObjsVisible, setGroqObjsVisible] = useState(false);
  const [hoveredGroq, setHoveredGroq] = useState<number | null>(null);

  // Compute displayed image layout for bbox positioning
  const handleResultImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img || !analysisResult) return;
    const { naturalWidth, naturalHeight, clientWidth, clientHeight } = img;
    const scale = Math.min(clientWidth / naturalWidth, clientHeight / naturalHeight);
    const actualW = naturalWidth * scale;
    const actualH = naturalHeight * scale;
    const offsetX = (clientWidth - actualW) / 2;
    const offsetY = (clientHeight - actualH) / 2;
    setImgLayout({ offsetX, offsetY, scale });
    setTimeout(() => setBboxesVisible(true), 600);
    setTimeout(() => setGroqObjsVisible(true), 900);
  }, [analysisResult]);

  // Typewriter effect for AI messages
  useEffect(() => {
    if (streamingIdx === null) return;
    const msg = messages[streamingIdx];
    if (!msg || msg.role !== 'ai') { setStreamingIdx(null); return; }
    const fullText = msg.text;
    if (streamingText.length >= fullText.length) {
      setStreamingIdx(null);
      return;
    }
    const timer = setTimeout(() => {
      setStreamingText(fullText.slice(0, streamingText.length + 2));
    }, 12);
    return () => clearTimeout(timer);
  }, [streamingText, streamingIdx, messages]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, chatLoading]);

  // Generate & download PDF report
  const downloadPDF = useCallback(() => {
    if (!analysisResult) return;
    const r = analysisResult;
    const ins = r.insights;
    const lines = [
      '═══════════════════════════════════════════',
      '         WASTEOS — WASTE ANALYSIS REPORT   ',
      '═══════════════════════════════════════════',
      '',
      `Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      `Time: ${new Date().toLocaleTimeString('en-IN')}`,
      '',
      '── CLASSIFICATION ─────────────────────────',
      `Final Category : ${r.final_category}`,
      `Analysis Source: ${r.analysis_source === 'yolo' ? 'YOLO Object Detection' : 'ML Classifier (Fallback)'}`,
      '',
      '── DETECTED OBJECTS ───────────────────────',
      ...(r.detected_objects.length > 0
        ? r.detected_objects.map((o, i) => `  ${i + 1}. ${o.label} (${(o.confidence * 100).toFixed(1)}%)`)
        : ['  No objects detected by YOLO']),
      '',
      '── ML SUPPORT ─────────────────────────────',
      `ML Category    : ${r.ml_support.category || 'N/A'}`,
      `ML Confidence  : ${r.ml_support.confidence ? (r.ml_support.confidence * 100).toFixed(1) + '%' : 'N/A'}`,
      '',
      '── DETECTED ITEMS ─────────────────────────',
      ...(ins ? ins.detected_items.map((item, i) => `  ${i + 1}. ${item}`) : ['  N/A']),
      '',
      '── DISPOSAL METHOD ────────────────────────',
      ins?.disposal_method || 'N/A',
      '',
      '── ENVIRONMENTAL IMPACT ───────────────────',
      ins?.environmental_impact || 'N/A',
      '',
      '── LANDFILL RISK ──────────────────────────',
      ins?.landfill_risk || 'N/A',
      '',
      '── RECOMMENDATION ─────────────────────────',
      ins?.user_advice || 'N/A',
      '',
      '═══════════════════════════════════════════',
      '  Powered by WasteOS YOLO v26 Engine',
      '═══════════════════════════════════════════',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WasteOS_Report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [analysisResult]);

  // Share analysis
  const shareReport = useCallback(async () => {
    if (!analysisResult) return;
    const r = analysisResult;
    const objLabels = r.detected_objects.map(o => o.label).join(', ');
    const text = `WasteOS Analysis: ${r.final_category} (${r.analysis_source === 'yolo' ? 'YOLO' : 'ML'}). Objects: ${objLabels || 'N/A'}. ${r.insights?.user_advice || ''}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'WasteOS Report', text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Report copied to clipboard!');
    }
  }, [analysisResult]);

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
        analysisResult,
        history.slice(0, -1),
      );
      setMessages(prev => {
        const updated = [...prev, { role: 'ai' as const, text: res.message }];
        setStreamingText("");
        setStreamingIdx(updated.length - 1);
        return updated;
      });
    } catch {
      setMessages(prev => {
        const updated = [...prev, { role: 'ai' as const, text: "Sorry, I couldn't process that request." }];
        setStreamingText("");
        setStreamingIdx(updated.length - 1);
        return updated;
      });
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
    setBboxesVisible(false);
    setHoveredBbox(null);
    setGroqObjsVisible(false);
    setHoveredGroq(null);
    setImgLayout({ offsetX: 0, offsetY: 0, scale: 1 });
  }, []);

  const analysisSteps = [
    { label: 'Image preprocessing complete', done: currentAnalysisStage > 0 },
    { label: 'Running YOLO v26 object detection...', done: currentAnalysisStage > 1 },
    { label: 'Classifying waste from detected objects...', done: currentAnalysisStage > 2 },
    { label: 'Generating sustainability report...', done: currentAnalysisStage > 3 },
    { label: 'Analysis complete', done: currentAnalysisStage >= 4 },
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
              YOLO v26 Ready
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
                  Analyze with YOLO v26
                </button>
                <button onClick={resetScan} className="btn-secondary px-5 py-3 rounded-full text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Re-upload
                </button>
              </div>
              <p className="text-center text-xs text-muted-foreground">YOLO v26 + WasteOS AI will analyze in ~3 seconds</p>
            </div>
          )}
        </div>
      )}

      {/* ANALYZING */}
      {step === 'analyzing' && (
        <div className="card-premium p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {imagePreview && (
        <div className="relative rounded-2xl overflow-hidden flex-shrink-0">
          <img src={imagePreview} alt="Analyzing" className="rounded-2xl w-full object-cover max-h-72" />
          {/* ── SCAN ANIMATION OVERLAY ── */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            {/* Dim layer */}
            <div className="absolute inset-0 bg-black/35 rounded-2xl" />
            {/* Sweep scan line — starts at top:0, translateY sweeps to bottom */}
            <div className="absolute left-0 right-0 top-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent 0%, #22C55E 15%, #4ADE80 50%, #22C55E 85%, transparent 100%)', boxShadow: '0 0 18px 4px rgba(34,197,94,0.7)', animation: 'scanLineAnim 2.2s linear infinite' }} />
            {/* Trailing glow, also starts at top:0 */}
            <div className="absolute left-0 right-0 top-0" style={{ height: '60px', background: 'linear-gradient(180deg, rgba(34,197,94,0.12) 0%, transparent 100%)', animation: 'scanTrailAnim 2.2s linear infinite' }} />
            {/* Corner brackets */}
            <div className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 border-emerald-400 rounded-tl" style={{ animation: 'bracketPulse 2s ease-in-out infinite', boxShadow: '-2px -2px 8px rgba(34,197,94,0.4)' }} />
            <div className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 border-emerald-400 rounded-tr" style={{ animation: 'bracketPulse 2s ease-in-out infinite 0.3s', boxShadow: '2px -2px 8px rgba(34,197,94,0.4)' }} />
            <div className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 border-emerald-400 rounded-bl" style={{ animation: 'bracketPulse 2s ease-in-out infinite 0.6s', boxShadow: '-2px 2px 8px rgba(34,197,94,0.4)' }} />
            <div className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-emerald-400 rounded-br" style={{ animation: 'bracketPulse 2s ease-in-out infinite 0.9s', boxShadow: '2px 2px 8px rgba(34,197,94,0.4)' }} />
            {/* Grid overlay */}
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            {/* Central crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 w-12 h-12 rounded-full border border-emerald-400/30" style={{ animation: 'pingRing 1.8s ease-out infinite' }} />
                <div className="absolute inset-0 w-12 h-12 rounded-full border border-emerald-400/20" style={{ animation: 'pingRing 1.8s ease-out infinite 0.6s' }} />
                <div className="w-12 h-12 rounded-full border border-emerald-400/50 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" style={{ animation: 'bracketPulse 1s ease-in-out infinite' }} />
                </div>
              </div>
            </div>
            {/* Scan status badge */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-300 font-mono tracking-widest">YOLO SCANNING</span>
            </div>
            {/* Bottom readout */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10">
              <span className="text-[9px] text-emerald-300/80 font-mono">{progress}%</span>
              <div className="w-16 h-0.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} /></div>
              <span className="text-[9px] text-white/40 font-mono">v26 SEG</span>
            </div>
          </div>
        </div>
      )}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">Analyzing waste...</h3>
              {analysisSteps.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  {s.done ? <Check className="w-4 h-4 text-primary shrink-0" /> : currentAnalysisStage === i || (i === 0 && currentAnalysisStage === 0) ? <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" /> : <div className="w-4 h-4 rounded-full border border-border shrink-0" />}
                  <span className={s.done ? 'text-foreground' : currentAnalysisStage === i || (i === 0 && currentAnalysisStage === 0) ? 'text-foreground' : 'text-muted-foreground'}>{s.label}</span>
                </div>
              ))}
              <div className="w-full h-1 bg-surface rounded-full overflow-hidden mt-4">
                <div className="h-full progress-bar-gradient transition-all duration-100" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">~{Math.max(0, Math.ceil((100 - progress) * 0.03 * 10) / 10)}s remaining</p>
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
              The uploaded image was not recognized as valid garbage or waste material by our YOLO v26 detection engine.
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
              {imagePreview
                ? <img ref={imgRef} src={imagePreview} alt="Analyzed" className="w-full h-full" style={{ objectFit: 'contain' }} onLoad={handleResultImageLoad} />
                : <div className="text-muted-foreground text-sm">Analysis Complete</div>
              }
              {/* ── BOUNDING BOX OVERLAYS ── */}
              {bboxesVisible && analysisResult.detected_objects.map((obj, i) => {
                const [x1, y1, x2, y2] = obj.bbox;
                const left = imgLayout.offsetX + x1 * imgLayout.scale;
                const top = imgLayout.offsetY + y1 * imgLayout.scale;
                const width = (x2 - x1) * imgLayout.scale;
                const height = (y2 - y1) * imgLayout.scale;
                const BBOX_COLORS = ['#22C55E','#3B82F6','#F59E0B','#EC4899','#8B5CF6','#EF4444','#06B6D4','#F97316'];
                const color = BBOX_COLORS[i % BBOX_COLORS.length];
                const isHovered = hoveredBbox === i;
                return (
                  <div
                    key={i}
                    className="absolute cursor-pointer"
                    style={{ left, top, width, height, animation: `bboxAppear 0.45s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.18}s both` }}
                    onMouseEnter={() => setHoveredBbox(i)}
                    onMouseLeave={() => setHoveredBbox(null)}
                  >
                    {/* Main border */}
                    <div className="absolute inset-0 rounded-sm transition-all duration-200" style={{ border: `2px solid ${color}`, boxShadow: isHovered ? `0 0 20px ${color}90, 0 0 40px ${color}40, inset 0 0 20px ${color}15` : `0 0 10px ${color}60, inset 0 0 8px ${color}08` }} />
                    {/* Corner dots */}
                    {[['top-0 left-0','-translate-x-1/2 -translate-y-1/2'],['top-0 right-0','translate-x-1/2 -translate-y-1/2'],['bottom-0 left-0','-translate-x-1/2 translate-y-1/2'],['bottom-0 right-0','translate-x-1/2 translate-y-1/2']].map(([pos, trans], di) => (
                      <div key={di} className={`absolute ${pos} ${trans} w-2 h-2 rounded-full`} style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}`, animation: `bracketPulse 1.5s ease-in-out infinite ${di * 0.15}s` }} />
                    ))}
                    {/* Confidence fill overlay */}
                    <div className="absolute inset-0 rounded-sm transition-opacity duration-200" style={{ background: `linear-gradient(135deg, ${color}12 0%, transparent 60%)`, opacity: isHovered ? 1 : 0.6 }} />
                    {/* Label badge */}
                    <div
                      className="absolute flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap"
                      style={{ top: top < 30 ? 'calc(100% + 4px)' : '-22px', left: '0', backgroundColor: color, boxShadow: `0 2px 8px ${color}60`, animation: `labelSlide 0.3s ease-out ${i * 0.18 + 0.25}s both`, opacity: 0 }}
                    >
                      <span>{obj.label.replace(/_/g, ' ')}</span>
                      <span className="opacity-80 font-normal">{(obj.confidence * 100).toFixed(0)}%</span>
                    </div>
                    {/* Hover tooltip */}
                    {isHovered && (
                      <div className="absolute z-20 px-2.5 py-1.5 rounded-lg text-[10px] text-white whitespace-nowrap" style={{ bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.85)', border: `1px solid ${color}50`, backdropFilter: 'blur(8px)' }}>
                        <div className="font-semibold">{obj.label.replace(/_/g, ' ')}</div>
                        <div className="text-white/60">Confidence: {(obj.confidence * 100).toFixed(1)}%</div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: CATEGORY_COLORS[analysisResult.final_category] || "#6B7280" }}>
                {analysisResult.final_category}
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className={`text-[10px] backdrop-blur px-2 py-1 rounded-full text-white font-medium ${analysisResult.analysis_source === 'yolo' ? 'bg-emerald-600/90' : 'bg-amber-600/90'}`}>
                  {analysisResult.analysis_source === 'yolo' ? 'YOLO Detection' : 'ML Fallback'}
                </span>
                <span className="text-[10px] bg-card/80 backdrop-blur px-2 py-1 rounded-full text-muted-foreground font-mono">WasteOS YOLO v26</span>
              </div>
              {/* ── GROQ VISUAL MARKERS ── */}
              {groqObjsVisible && (analysisResult.groq_objects || []).map((obj: GroqObject, i: number) => {
                const left = imgLayout.offsetX + obj.x1 * (analysisResult.image_width || 1) * imgLayout.scale;
                const top  = imgLayout.offsetY + obj.y1 * (analysisResult.image_height || 1) * imgLayout.scale;
                const width  = (obj.x2 - obj.x1) * (analysisResult.image_width || 1) * imgLayout.scale;
                const height = (obj.y2 - obj.y1) * (analysisResult.image_height || 1) * imgLayout.scale;
                const GROQ_COLORS = ['#06B6D4','#A855F7','#F59E0B','#EC4899','#22C55E','#EF4444','#3B82F6','#F97316'];
                const color = GROQ_COLORS[i % GROQ_COLORS.length];
                const isMostlyDuplicate = analysisResult.detected_objects.some(d => {
                  const [dx1, dy1, dx2, dy2] = d.bbox;
                  const overlapX = Math.max(0, Math.min(obj.x2 * (analysisResult.image_width || 1), dx2) - Math.max(obj.x1 * (analysisResult.image_width || 1), dx1));
                  const overlapY = Math.max(0, Math.min(obj.y2 * (analysisResult.image_height || 1), dy2) - Math.max(obj.y1 * (analysisResult.image_height || 1), dy1));
                  const groqArea = width * height / (imgLayout.scale * imgLayout.scale);
                  return groqArea > 0 && (overlapX * overlapY) / groqArea > 0.5;
                });
                if (isMostlyDuplicate) return null;
                const isHov = hoveredGroq === i;
                const cx = left + width / 2;
                const cy = top + height / 2;
                return (
                  <div key={`grq-${i}`} className="absolute pointer-events-none" style={{ left: 0, top: 0, width: '100%', height: '100%' }}>
                    {/* Dashed groq box */}
                    <div
                      className="absolute cursor-pointer pointer-events-auto"
                      style={{ left, top, width, height, border: `1.5px dashed ${color}`, borderRadius: 4, boxShadow: isHov ? `0 0 16px ${color}80` : `0 0 6px ${color}40`, animation: `bboxAppear 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.14 + 0.1}s both`, background: isHov ? `${color}12` : 'transparent', transition: 'box-shadow 0.2s, background 0.2s' }}
                      onMouseEnter={() => setHoveredGroq(i)}
                      onMouseLeave={() => setHoveredGroq(null)}
                    />
                    {/* Pin marker at center */}
                    <div
                      className="absolute cursor-pointer pointer-events-auto flex items-center justify-center"
                      style={{ left: cx - 10, top: cy - 10, width: 20, height: 20, animation: `pinDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.14 + 0.25}s both` }}
                      onMouseEnter={() => setHoveredGroq(i)}
                      onMouseLeave={() => setHoveredGroq(null)}
                    >
                      <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}, 0 0 20px ${color}60` }} />
                    </div>
                    {/* Label */}
                    <div
                      className="absolute px-2 py-0.5 rounded text-[10px] font-semibold text-white whitespace-nowrap pointer-events-none"
                      style={{ left, top: top > 28 ? top - 22 : top + height + 4, backgroundColor: `${color}dd`, boxShadow: `0 2px 8px ${color}50`, animation: `labelSlide 0.3s ease-out ${i * 0.14 + 0.35}s both`, opacity: 0 }}
                    >
                      ✦ {obj.label}
                    </div>
                    {/* Hover tooltip */}
                    {isHov && (
                      <div className="absolute z-30 px-2.5 py-1.5 rounded-lg text-[10px] text-white whitespace-nowrap pointer-events-none" style={{ left: cx - 40, top: top > 50 ? top - 48 : top + height + 6, backgroundColor: 'rgba(0,0,0,0.9)', border: `1px solid ${color}60`, backdropFilter: 'blur(8px)' }}>
                        <div className="font-semibold text-white">{obj.label}</div>
                        <div className="text-white/50 text-[9px]">WasteOS AI Vision</div>
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Object count badge */}
              {(analysisResult.detected_objects.length > 0 || (analysisResult.groq_objects || []).length > 0) && (
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  {analysisResult.detected_objects.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-emerald-500/30 text-white text-[10px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {analysisResult.detected_objects.length} objects
                    </div>
                  )}
                  {(analysisResult.groq_objects || []).length > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-cyan-500/30 text-white text-[10px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {(analysisResult.groq_objects || []).length} AI markers
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-premium p-4 text-center">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="font-display font-semibold mt-1" style={{ color: CATEGORY_COLORS[analysisResult.final_category] || "#6B7280" }}>{analysisResult.final_category}</p>
            </div>
            <div className="card-premium p-4 text-center">
              <p className="text-xs text-muted-foreground">Objects Found</p>
              <p className="font-display font-semibold text-foreground mt-1">{analysisResult.detected_objects.length}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{analysisResult.analysis_source === 'yolo' ? 'via YOLO' : 'ML fallback'}</p>
            </div>
            <div className="card-premium p-4 text-center">
              <p className="text-xs text-muted-foreground">Detected Items</p>
              <p className="font-display font-semibold text-foreground mt-1 text-sm">{analysisResult.insights?.detected_items?.join(", ") || "—"}</p>
            </div>
            <div className="card-premium p-4 text-center">
              <p className="text-xs text-muted-foreground">Disposal</p>
              <p className="font-display font-semibold text-primary mt-1 text-sm">{analysisResult.insights?.disposal_method || "—"}</p>
            </div>
          </div>

          {/* Detected Objects from YOLO */}
          {analysisResult.detected_objects.length > 0 && (
            <div className="card-premium p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">YOLO Objects:</span>
                {analysisResult.detected_objects.map((o, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {o.label} ({(o.confidence * 100).toFixed(0)}%)
                  </span>
                ))}
                {analysisResult.ml_support.category && (
                  <span className="ml-auto text-[10px] text-muted-foreground">ML support: {analysisResult.ml_support.category} ({(analysisResult.ml_support.confidence * 100).toFixed(1)}%)</span>
                )}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-premium p-5 space-y-4">
              <h3 className="font-display font-semibold text-foreground">Environmental Insights</h3>

              {analysisResult.insights ? (
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
              ) : (
                <div className="p-3 rounded-xl bg-secondary/50">
                  <p className="text-sm text-muted-foreground">Environmental insights unavailable for this analysis.</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {(analysisResult.insights?.detected_items || []).map((item, i) => (
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
                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                      {m.role === 'ai' && streamingIdx === i ? (
                        <>{streamingText}<span className="inline-block w-1.5 h-3 bg-primary/60 ml-0.5 animate-pulse" /></>
                      ) : m.text}
                    </div>
                  </div>
                ))}
                {chatLoading && <div className="flex justify-start"><div className="px-3 py-2 rounded-2xl bg-secondary text-xs text-muted-foreground">Thinking<span className="dots-animation">...</span></div></div>}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat(chatInput)} placeholder="Ask about this waste..." className="flex-1 h-9 px-4 rounded-full bg-surface text-sm border-none outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={() => sendChat(chatInput)} className="w-9 h-9 rounded-full btn-primary-gradient flex items-center justify-center shrink-0"><Send className="w-3.5 h-3.5 text-primary-foreground" /></button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={downloadPDF} className="btn-secondary px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"><Download className="w-4 h-4" /> Download Report</button>
            <button onClick={shareReport} className="px-5 py-2.5 rounded-full text-primary text-sm font-medium hover:bg-primary-glow transition-colors flex items-center gap-2"><Share2 className="w-4 h-4" /> Share Impact</button>
            <button onClick={resetScan} className="btn-primary-gradient text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2">Scan Another <ArrowRight className="w-4 h-4" /></button>
            <span className="px-4 py-2 rounded-full bg-primary-glow text-primary text-sm font-semibold animate-fade-in">+240 Green Points Earned!</span>
          </div>
        </div>
      )}

      {/* ── GLOBAL ANIMATION KEYFRAMES (always mounted) ── */}
      <style>{`
        @keyframes cameraScanner {
          0% { top: 8%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 92%; opacity: 0; }
        }
        @keyframes scanLineAnim {
          0%   { transform: translateY(0);    opacity: 0; }
          3%   { opacity: 1; }
          97%  { opacity: 1; }
          100% { transform: translateY(500px); opacity: 0; }
        }
        @keyframes scanTrailAnim {
          0%   { transform: translateY(-60px); opacity: 0; }
          3%   { opacity: 1; }
          97%  { opacity: 1; }
          100% { transform: translateY(500px); opacity: 0; }
        }
        @keyframes bracketPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes pingRing {
          0%   { transform: scale(0.95); opacity: 0.6; }
          100% { transform: scale(2.2);  opacity: 0; }
        }
        @keyframes bboxAppear {
          0%   { transform: scale(0.75); opacity: 0; }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes labelSlide {
          0%   { transform: translateY(6px); opacity: 0; }
          100% { transform: translateY(0);   opacity: 1; }
        }
        @keyframes pinDrop {
          0%   { transform: scale(0) translateY(-8px); opacity: 0; }
          60%  { transform: scale(1.3) translateY(2px); opacity: 1; }
          100% { transform: scale(1) translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}