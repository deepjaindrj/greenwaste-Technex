import { useState, useRef, useEffect } from "react";
import {
  Truck, Camera, CheckCircle, MapPin, Package, ArrowRight, Loader2,
  AlertTriangle, Leaf, Droplets, Recycle, Scale, Star, RefreshCw,
} from "lucide-react";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import {
  getTrucks, getAssignedPickups, startRoute, startCollecting,
  analyzeWastePhoto, completePickup,
} from "@/lib/api";

type PickupStatus = 'Confirmed' | 'En Route' | 'Collecting' | 'Analyzing' | 'Complete';

interface AssignedPickup {
  id: string;
  citizen_id: string;
  waste_type: string;
  date: string;
  time_window: string;
  address: string;
  status: PickupStatus;
  profiles?: { full_name: string };
}

interface AnalysisResult {
  wetKg: number;
  dryKg: number;
  hazardousKg: number;
  totalKg: number;
  segregationScore: number;
  creditsEarned: number;
  co2SavedKg: number;
  items: { name: string; category: string; weight: number }[];
}

const statusSteps: PickupStatus[] = ['Confirmed', 'En Route', 'Collecting', 'Analyzing', 'Complete'];
const statusColors: Record<string, string> = {
  Confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'En Route': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Collecting: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Analyzing: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  Complete: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function TruckDriver() {
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [activePickup, setActivePickup] = useState<AssignedPickup | null>(null);
  const [localStatus, setLocalStatus] = useState<PickupStatus | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: trucksData } = useSupabaseQuery(['trucks'], () => getTrucks());
  const { data: pickupsData, refetch: refetchPickups } = useSupabaseQuery(
    ['assigned-pickups', selectedTruck ?? ''],
    () => getAssignedPickups(selectedTruck!),
    { enabled: !!selectedTruck, refetchInterval: 10000 },
  );

  const trucks = trucksData ?? [];
  const pickups: AssignedPickup[] = (pickupsData ?? []).map((p: any) => ({
    id: p.id,
    citizen_id: p.citizen_id,
    waste_type: p.waste_type ?? 'Mixed',
    date: p.date,
    time_window: p.time_window ?? '',
    address: p.address ?? '',
    status: p.status as PickupStatus,
    profiles: p.profiles,
  }));

  // Filter out completed ones in this session
  const activePickups = pickups.filter(p => !completedIds.has(p.id));

  const effectiveStatus = localStatus ?? activePickup?.status ?? null;

  const handleSelectPickup = (p: AssignedPickup) => {
    setActivePickup(p);
    setLocalStatus(p.status);
    setCapturedImage(null);
    setCapturedFile(null);
    setAnalysis(null);
  };

  const handleStartRoute = async () => {
    if (!activePickup) return;
    setLocalStatus('En Route');
    try { await startRoute(activePickup.id); } catch { /* optimistic */ }
  };

  const handleArrive = async () => {
    if (!activePickup) return;
    setLocalStatus('Collecting');
    try { await startCollecting(activePickup.id); } catch { /* optimistic */ }
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedFile(file);
    const reader = new FileReader();
    reader.onload = () => setCapturedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!capturedFile || !activePickup) return;
    setAnalyzing(true);
    setLocalStatus('Analyzing');
    try {
      const result = await analyzeWastePhoto(capturedFile, activePickup.waste_type as any);
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis failed', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleComplete = async () => {
    if (!activePickup || !analysis) return;
    setCompleting(true);
    try {
      await completePickup(activePickup.id, activePickup.citizen_id, {
        wetKg: analysis.wetKg,
        dryKg: analysis.dryKg,
        hazardousKg: analysis.hazardousKg,
        segregationScore: analysis.segregationScore,
        creditsEarned: analysis.creditsEarned,
        co2SavedKg: analysis.co2SavedKg,
      }, selectedTruck ?? undefined);
      setLocalStatus('Complete');
      setCompletedIds(prev => new Set(prev).add(activePickup.id));
      // Auto-reset after 3s
      setTimeout(() => {
        setActivePickup(null);
        setLocalStatus(null);
        setCapturedImage(null);
        setCapturedFile(null);
        setAnalysis(null);
        refetchPickups();
      }, 3000);
    } catch (err) {
      console.error('Complete failed', err);
    } finally {
      setCompleting(false);
    }
  };

  // ─── Truck Selection Screen ──────────────────────────────────
  if (!selectedTruck) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 stagger-fade-in">
        <div className="green-gradient grain-overlay rounded-2xl p-6 md:p-8 overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Truck className="w-6 h-6 text-white" />
              <h1 className="text-xl md:text-2xl font-display font-semibold text-white">Truck Driver Console</h1>
            </div>
            <p className="text-white/80 text-sm">Select your assigned truck to view pickups</p>
          </div>
        </div>

        <div className="card-premium p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Select Your Truck</h3>
          {trucks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trucks found. Please add trucks in the database.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {trucks.map((truck: any) => (
                <button
                  key={truck.id}
                  onClick={() => setSelectedTruck(truck.id)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/30 hover:bg-primary-glow hover:border-primary/30 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-glow flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Truck className="w-5 h-5 text-primary group-hover:text-white" />
                  </div>
                  <div>
                    <p className="font-mono font-semibold text-foreground">{truck.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {truck.driver_name ?? 'Unassigned'} · {truck.status ?? 'Active'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Main Driver Dashboard ───────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6 stagger-fade-in">
      {/* Header */}
      <div className="green-gradient grain-overlay rounded-2xl p-6 overflow-hidden relative">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Truck className="w-5 h-5 text-white" />
              <h1 className="text-lg md:text-xl font-display font-semibold text-white">Truck {selectedTruck}</h1>
            </div>
            <p className="text-white/80 text-sm">{activePickups.length} pickup{activePickups.length !== 1 ? 's' : ''} assigned</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refetchPickups()}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              title="Refresh pickups"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => { setSelectedTruck(null); setActivePickup(null); setLocalStatus(null); }}
              className="px-4 py-2 rounded-full bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors"
            >
              Switch Truck
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Assigned Pickups List */}
        <div className="lg:col-span-2 card-premium p-5">
          <h3 className="font-display font-semibold text-foreground mb-3">Assigned Pickups</h3>
          {activePickups.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No pickups assigned yet</p>
              <p className="text-xs text-muted-foreground mt-1">Wait for municipal to assign pickups to your truck</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activePickups.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPickup(p)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    activePickup?.id === p.id
                      ? 'bg-primary-glow border-primary/30'
                      : 'bg-secondary/30 border-border/50 hover:bg-secondary/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{p.profiles?.full_name ?? 'Citizen'}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[p.status] ?? ''}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{p.address || 'No address'}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {p.waste_type} · {p.time_window} · {p.date}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Pickup Detail */}
        <div className="lg:col-span-3 space-y-4">
          {!activePickup ? (
            <div className="card-premium p-8 text-center">
              <Truck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a pickup from the list to start</p>
            </div>
          ) : (
            <>
              {/* Status Progress */}
              <div className="card-premium p-5">
                <h3 className="font-display font-semibold text-foreground mb-4 text-sm">Collection Progress</h3>
                <div className="flex items-center gap-1">
                  {statusSteps.map((step, i) => {
                    const currentIdx = statusSteps.indexOf(effectiveStatus ?? 'Confirmed');
                    const isDone = i <= currentIdx;
                    const isCurrent = i === currentIdx;
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                          isDone
                            ? 'bg-primary text-white'
                            : 'bg-secondary text-muted-foreground'
                        } ${isCurrent ? 'ring-2 ring-primary/30 ring-offset-2' : ''}`}>
                          {isDone && i < currentIdx ? <CheckCircle className="w-4 h-4" /> : i + 1}
                        </div>
                        <span className={`text-[9px] mt-1 ${isDone ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pickup Info */}
              <div className="card-premium p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{activePickup.profiles?.full_name ?? 'Citizen'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {activePickup.address || 'No address provided'}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{activePickup.id.slice(0, 15)}</span>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded-full bg-secondary">{activePickup.waste_type}</span>
                  <span className="px-2 py-1 rounded-full bg-secondary">{activePickup.time_window}</span>
                  <span className="px-2 py-1 rounded-full bg-secondary">{activePickup.date}</span>
                </div>
              </div>

              {/* Action Buttons Based on Status */}
              {effectiveStatus === 'Confirmed' && (
                <button
                  onClick={handleStartRoute}
                  className="w-full btn-primary-gradient text-white py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" /> Start Route
                </button>
              )}

              {effectiveStatus === 'En Route' && (
                <button
                  onClick={handleArrive}
                  className="w-full btn-primary-gradient text-white py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" /> Arrived — Start Collecting
                </button>
              )}

              {effectiveStatus === 'Collecting' && !capturedImage && (
                <div className="card-premium p-5 space-y-4">
                  <h3 className="font-display font-semibold text-foreground text-sm">Capture Waste Photo</h3>
                  <p className="text-xs text-muted-foreground">Take a photo of the collected waste for AI analysis</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCapture}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-12 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center gap-3 group"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary-glow flex items-center justify-center group-hover:bg-primary transition-colors">
                      <Camera className="w-6 h-6 text-primary group-hover:text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground">
                      Tap to capture or upload photo
                    </span>
                  </button>
                </div>
              )}

              {effectiveStatus === 'Collecting' && capturedImage && !analysis && (
                <div className="card-premium p-5 space-y-4">
                  <h3 className="font-display font-semibold text-foreground text-sm">Photo Captured</h3>
                  <img src={capturedImage} alt="Captured waste" className="w-full h-48 object-cover rounded-xl" />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setCapturedImage(null); setCapturedFile(null); }}
                      className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
                    >
                      Retake
                    </button>
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="flex-1 btn-primary-gradient text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : <><Scale className="w-4 h-4" /> Analyze Waste</>}
                    </button>
                  </div>
                </div>
              )}

              {/* Analysis Results */}
              {(effectiveStatus === 'Analyzing' || analysis) && analysis && (
                <div className="card-premium p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-foreground text-sm">AI Waste Analysis</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      analysis.segregationScore >= 80 ? 'bg-green-100 text-green-700' :
                      analysis.segregationScore >= 60 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Score: {analysis.segregationScore}/100
                    </span>
                  </div>

                  {capturedImage && (
                    <img src={capturedImage} alt="Analyzed waste" className="w-full h-32 object-cover rounded-xl opacity-80" />
                  )}

                  {/* Weight Breakdown */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-center">
                      <Droplets className="w-4 h-4 text-green-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-green-700 dark:text-green-400">{analysis.wetKg}</p>
                      <p className="text-[10px] text-green-600">Wet (kg)</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
                      <Recycle className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{analysis.dryKg}</p>
                      <p className="text-[10px] text-amber-600">Dry (kg)</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-red-700 dark:text-red-400">{analysis.hazardousKg}</p>
                      <p className="text-[10px] text-red-600">Hazardous (kg)</p>
                    </div>
                  </div>

                  {/* Credentials Earned */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-primary-glow border border-primary/10">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs font-semibold text-primary">{analysis.creditsEarned} Carbon Credits</p>
                        <p className="text-[10px] text-primary/70">{analysis.co2SavedKg} kg CO₂ saved</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-primary">{analysis.totalKg} kg</p>
                  </div>

                  {/* Detected Items */}
                  <div>
                    <p className="text-xs font-medium text-foreground mb-2">Detected Items</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.items.map((item, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                          {item.name} ({item.weight} kg)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Complete Button */}
                  {effectiveStatus !== 'Complete' && (
                    <button
                      onClick={handleComplete}
                      disabled={completing}
                      className="w-full btn-primary-gradient text-white py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {completing ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Recording Collection…</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> Complete Collection &amp; Award Credits</>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Completion Success */}
              {effectiveStatus === 'Complete' && (
                <div className="card-premium p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">Collection Complete!</h3>
                  <p className="text-sm text-muted-foreground">
                    {analysis?.creditsEarned ?? 0} carbon credits awarded to citizen
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-primary">
                    <Star className="w-3.5 h-3.5" />
                    <span>Great job! Moving to next pickup…</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
