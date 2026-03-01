import { useState, useCallback } from "react";
import { Camera, Upload, Cpu, FileText, Check, Loader2, Send, Download, Share2, ArrowRight, X, RefreshCw } from "lucide-react";
import { scanResults } from "@/lib/mockData";
import { getChatResponse } from "@/lib/api";

type Step = 'capture' | 'camera' | 'analyzing' | 'results';

const suggestedQuestions = ["How to recycle this?", "Nearest recycling center?", "CO₂ savings if recycled?"];

export default function Scan() {
  const [step, setStep] = useState<Step>('capture');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const openCamera = useCallback(() => {
    setStep('camera');
  }, []);

  const captureFromCamera = useCallback(() => {
    // Simulate capture
    setImagePreview('/placeholder.svg');
    setStep('capture');
  }, []);

  const startAnalysis = useCallback(() => {
    setStep('analyzing');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setTimeout(() => setStep('results'), 300); return 100; }
        return prev + 4;
      });
    }, 80);
  }, []);

  const sendChat = useCallback(async (msg: string) => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatInput("");
    setChatLoading(true);
    const res = await getChatResponse(msg);
    setMessages(prev => [...prev, { role: 'ai', text: res.message }]);
    setChatLoading(false);
  }, []);

  const analysisSteps = [
    { label: 'Image preprocessing complete', done: progress > 20 },
    { label: 'Running YOLO v8 object detection...', done: progress > 45 },
    { label: 'Classifying waste categories...', done: progress > 70 },
    { label: 'Calculating carbon impact', done: progress > 85 },
    { label: 'Generating report', done: progress >= 100 },
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

      {/* CAMERA VIEWFINDER */}
      {step === 'camera' && (
        <div className="card-premium p-6">
          <div className="relative w-full rounded-2xl overflow-hidden bg-[#0F172A]" style={{ aspectRatio: '16/9' }}>
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#22C55E] z-10" />
            <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#22C55E] z-10" />
            <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#22C55E] z-10" />
            <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#22C55E] z-10" />

            {/* Scanning line */}
            <div className="absolute left-[8%] right-[8%] h-0.5 bg-primary/70 z-10" style={{ animation: 'cameraScanner 2s ease-in-out infinite', boxShadow: '0 0 12px rgba(34,197,94,0.5)' }} />

            {/* Center crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-3 h-3 rounded-full bg-primary pulse-glow" />
            </div>

            {/* Dark feed placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="w-12 h-12 text-white/10" />
            </div>

            {/* Top badges */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/90 text-white text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE SCAN
            </div>
            <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-white/10 text-white/70 text-[10px] font-mono">
              YOLO v8 Ready
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm px-4 py-2.5 text-center">
              <p className="text-white/80 text-xs">Point at waste object to detect</p>
            </div>
          </div>

          {/* Camera controls */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <button onClick={captureFromCamera} className="btn-primary-gradient text-white px-8 py-3 rounded-full text-sm font-medium flex items-center gap-2">
              📸 Capture
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
              <p className="text-sm text-muted-foreground mb-6">Supports JPG, PNG, WEBP · Max 10MB</p>
              <div className="flex gap-3">
                <button onClick={openCamera} className="btn-primary-gradient text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Open Camera
                </button>
                <label className="btn-secondary px-6 py-2.5 rounded-full text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden">
                <img src={imagePreview} alt="Captured waste" className="w-full max-h-96 object-cover rounded-2xl" />
                <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">Image Captured ✓</span>
              </div>
              <div className="flex justify-center">
                <button onClick={startAnalysis} className="btn-primary-gradient text-primary-foreground px-8 py-3 rounded-full text-sm font-medium flex items-center gap-2 shimmer" style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, #22C55E 0%, #16A34A 25%, #10B981 50%, #16A34A 75%, #22C55E 100%)' }}>
                  🔍 Analyze with AI
                </button>
              </div>
              <p className="text-center text-xs text-muted-foreground">YOLO v8 + WasteOS AI will analyze in ~2 seconds</p>
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
              <h3 className="font-display font-semibold text-foreground">Analyzing waste...</h3>
              {analysisSteps.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  {s.done ? <Check className="w-4 h-4 text-primary shrink-0" /> : progress > (i * 20) ? <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" /> : <div className="w-4 h-4 rounded-full border border-border shrink-0" />}
                  <span className={s.done ? 'text-foreground' : 'text-muted-foreground'}>{s.label}</span>
                </div>
              ))}
              <div className="w-full h-1 bg-surface rounded-full overflow-hidden mt-4">
                <div className="h-full progress-bar-gradient transition-all duration-100" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">~{Math.max(0, Math.ceil((100 - progress) * 0.024 * 10) / 10)}s remaining</p>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {step === 'results' && (
        <div className="space-y-6">
          <div className="card-premium p-5">
            <div className="relative rounded-2xl overflow-hidden bg-foreground/5 h-72 flex items-center justify-center">
              {imagePreview ? <img src={imagePreview} alt="Analyzed" className="w-full h-full object-cover" /> : <div className="text-muted-foreground text-sm">Analysis Complete</div>}
              {scanResults.items.map((item, i) => (
                <div key={i} className="absolute border-2 rounded-lg" style={{ left: `${item.bbox.x}%`, top: `${item.bbox.y}%`, width: `${item.bbox.w}%`, height: `${item.bbox.h}%`, borderColor: item.color }}>
                  <span className="absolute -top-5 left-0 text-[10px] px-2 py-0.5 rounded-full font-medium text-primary-foreground" style={{ backgroundColor: item.color }}>
                    {item.name} — {item.category} {item.confidence}%
                  </span>
                </div>
              ))}
              <span className="absolute top-3 right-3 text-[10px] bg-card/80 backdrop-blur px-2 py-1 rounded-full text-muted-foreground font-mono">WasteOS YOLO Analysis</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-premium p-4 text-center"><p className="text-xs text-muted-foreground">Waste Type</p><p className="font-display font-semibold text-foreground mt-1">Mixed · 3 Items</p></div>
            <div className="card-premium p-4 text-center"><p className="text-xs text-muted-foreground">Segregation Score</p><p className="font-display font-semibold text-warning mt-1">{scanResults.segregationScore}%</p></div>
            <div className="card-premium p-4 text-center"><p className="text-xs text-muted-foreground">CO₂ Impact</p><p className="font-display font-semibold mt-1"><span className="text-destructive">+{scanResults.totalCO2.landfill}kg</span> / <span className="text-primary">{scanResults.totalCO2.recycled}kg</span></p></div>
            <div className="card-premium p-4 text-center"><p className="text-xs text-muted-foreground">Recommended</p><p className="font-display font-semibold text-primary mt-1">{scanResults.recommendation}</p></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-premium p-5">
              <h3 className="font-display font-semibold text-foreground mb-3">Detailed Breakdown</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
                  <span>Item</span><span>Category</span><span>Confidence</span><span>CO₂</span><span>Disposal</span>
                </div>
                {scanResults.items.map((item, i) => (
                  <div key={i} className={`grid grid-cols-5 gap-2 text-xs py-2 ${i % 2 === 0 ? 'bg-secondary/30' : ''} rounded-lg px-1`}>
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: item.color + '20', color: item.color }}>{item.category}</span>
                    <span className="text-foreground">{item.confidence}%</span>
                    <span className="text-muted-foreground">{item.co2Impact}</span>
                    <span className="text-muted-foreground">{item.disposal.split('—')[0]}</span>
                  </div>
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
            <button onClick={() => { setStep('capture'); setImagePreview(null); setMessages([]); }} className="btn-primary-gradient text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2">Scan Another <ArrowRight className="w-4 h-4" /></button>
            <span className="px-4 py-2 rounded-full bg-primary-glow text-primary text-sm font-semibold animate-fade-in">+240 Green Points Earned! 🎉</span>
          </div>
        </div>
      )}
    </div>
  );
}