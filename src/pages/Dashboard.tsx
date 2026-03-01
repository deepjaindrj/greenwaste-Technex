import { ArrowRight, Leaf, Trash2, Flame, Zap, CheckCircle, Camera, Trophy, Wallet, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCitizen } from "@/hooks/use-citizen";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { getMyPickups, getCollectionHistory, getCarbonWallet } from "@/lib/api";
import { pickupRequests as mockPickups, collectionHistory as mockHistory, carbonWalletData as mockWallet } from "@/lib/mockData";
import { normalizeWallet, normalizePickups, normalizeCollections } from "@/lib/normalize";

const quickLinks = [
  { label: 'Scanner', icon: Camera, path: '/scan' },
  { label: 'Request Pickup', icon: Trash2, path: '/request-pickup' },
  { label: 'Carbon Wallet', icon: Wallet, path: '/carbon' },
  { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { citizenId } = useCitizen();

  const { data: pickups } = useSupabaseQuery(
    ['pickups', citizenId],
    () => getMyPickups(citizenId!),
    { enabled: !!citizenId },
  );
  const { data: collections } = useSupabaseQuery(
    ['collections', citizenId],
    () => getCollectionHistory(citizenId!),
    { enabled: !!citizenId },
  );
  const { data: wallet } = useSupabaseQuery(
    ['wallet', citizenId],
    () => getCarbonWallet(citizenId!),
    { enabled: !!citizenId },
  );

  const pickupRequests = pickups ? normalizePickups(pickups) : mockPickups;
  const collectionHistory = collections ? normalizeCollections(collections) : mockHistory;
  const carbonWalletData = normalizeWallet(wallet, mockWallet);
  const nextPickup = pickupRequests[0] ?? {
    id: '', wasteType: 'Mixed', date: '', timeWindow: 'Morning 7-9 AM',
    status: 'Requested', collector: undefined, truckId: undefined, eta: undefined,
  };

  const personalKpis = [
    { icon: Leaf, label: 'CO₂ Saved', value: carbonWalletData.co2Saved, color: 'text-primary' },
    { icon: Trash2, label: 'Waste Collected', value: `${collectionHistory.reduce((s, c) => s + c.wetKg + c.dryKg + c.hazardousKg, 0).toFixed(1)} kg`, color: 'text-accent' },
    { icon: Flame, label: 'Streak', value: `${carbonWalletData.streak} days`, color: 'text-warning' },
    { icon: Zap, label: 'Credits This Month', value: `+${carbonWalletData.monthlyCredits}`, color: 'text-primary' },
    { icon: CheckCircle, label: 'Segregation Score', value: `${collectionHistory.length ? Math.round(collectionHistory.reduce((s, c) => s + c.segregationScore, 0) / collectionHistory.length) : 78}%`, color: 'text-primary' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 stagger-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your personal waste & carbon overview</p>
      </div>

      {/* Hero Banner */}
      <div className="green-gradient grain-overlay rounded-2xl p-6 md:p-8 flex items-center justify-between overflow-hidden">
        <div className="z-10 relative">
          <p className="text-sm text-white/80">Carbon Credits Balance</p>
          <p className="text-4xl font-display font-bold text-white mt-1">{carbonWalletData.totalCredits.toLocaleString()}</p>
          <p className="text-white/70 text-sm mt-1">+{collectionHistory[0]?.creditsEarned ?? 0} from last collection</p>
        </div>
        <button onClick={() => navigate('/request-pickup')} className="hidden md:flex z-10 relative items-center gap-2 btn-primary-gradient text-white px-6 py-3 rounded-full text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
          Request Pickup Now <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {personalKpis.map(kpi => (
          <div key={kpi.label} className="card-premium p-4 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-primary-glow flex items-center justify-center">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-display font-bold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left */}
        <div className="lg:col-span-3 space-y-6">
          {/* Next Pickup Status */}
          <div className="card-premium p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-foreground">Next Pickup</h3>
              {pickupRequests.length > 0 ? (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  nextPickup.status === 'En Route' ? 'bg-primary-glow text-primary' :
                  nextPickup.status === 'Complete' ? 'bg-primary-glow text-primary' :
                  'bg-warning/10 text-warning'
                }`}>{nextPickup.status}</span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-secondary text-muted-foreground">None</span>
              )}
            </div>
            {pickupRequests.length > 0 ? (
              <div className="space-y-2 text-sm">
                {nextPickup.collector && <p className="text-foreground"><span className="text-muted-foreground">Collector:</span> {nextPickup.collector}</p>}
                {nextPickup.truckId && <p className="text-foreground"><span className="text-muted-foreground">Truck:</span> {nextPickup.truckId}</p>}
                {nextPickup.eta && <p className="text-primary font-medium">ETA: {nextPickup.eta}</p>}
                <p className="text-foreground"><span className="text-muted-foreground">Time:</span> {nextPickup.timeWindow}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pickups scheduled. Request one to get started!</p>
            )}
            <button onClick={() => navigate('/collection')} className="mt-4 text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Track Live <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Recent Collections */}
          <div className="card-premium p-5">
            <h3 className="font-display font-semibold text-foreground mb-3">Recent Collections</h3>
            <div className="space-y-3">
              {collectionHistory.slice(0, 3).map(c => (
                <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.date}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">Wet {c.wetKg}kg</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning">Dry {c.dryKg}kg</span>
                      {c.hazardousKg > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">Haz {c.hazardousKg}kg</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.segregationScore >= 80 ? 'bg-primary-glow text-primary' : 'bg-warning/10 text-warning'}`}>
                      {c.segregationScore}%
                    </span>
                    <span className="text-xs font-medium text-primary">+{c.creditsEarned}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Links */}
          <div className="card-premium p-5">
            <h3 className="font-display font-semibold text-foreground mb-3">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {quickLinks.map(link => (
                <button key={link.label} onClick={() => navigate(link.path)} className="flex items-center gap-2.5 p-3 rounded-2xl border border-border hover:border-border-highlight transition-all duration-200 hover:-translate-y-0.5 text-left bg-card" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                  <div className="w-9 h-9 rounded-xl bg-primary-glow flex items-center justify-center shrink-0">
                    <link.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Personal Impact */}
          <div className="card-premium p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Your Impact</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-glow flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-display font-bold text-foreground">{carbonWalletData.treesSaved} trees</p>
                  <p className="text-[10px] text-muted-foreground">Equivalent trees saved</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-glow flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-display font-bold text-foreground">{carbonWalletData.energySaved}</p>
                  <p className="text-[10px] text-muted-foreground">Energy saved</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-glow flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xl font-display font-bold text-foreground">{carbonWalletData.co2Saved}</p>
                  <p className="text-[10px] text-muted-foreground">CO₂ saved lifetime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
