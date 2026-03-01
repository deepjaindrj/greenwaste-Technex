import { ArrowRight, Leaf, Trash2, Flame, Zap, CheckCircle, Camera, Trophy, Wallet, MapPin, TrendingUp, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCitizen } from "@/hooks/use-citizen";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { getMyPickups, getCollectionHistory, getCarbonWallet } from "@/lib/api";
import { pickupRequests as mockPickups, collectionHistory as mockHistory, carbonWalletData as mockWallet } from "@/lib/mockData";
import { normalizeWallet, normalizePickups, normalizeCollections } from "@/lib/normalize";

const quickLinks = [
  { label: 'Waste Scanner', icon: Camera, path: '/scan', gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50' },
  { label: 'Request Pickup', icon: Trash2, path: '/request-pickup', gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
  { label: 'Carbon Wallet', icon: Wallet, path: '/carbon', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50' },
  { label: 'Leaderboard', icon: Trophy, path: '/leaderboard', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50' },
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
    id: '', wasteType: 'Mixed', date: '', timeWindow: 'Morning 7–9 AM',
    status: 'Requested', collector: undefined, truckId: undefined, eta: undefined,
  };

  const totalWaste = collectionHistory.reduce((s, c) => s + c.wetKg + c.dryKg + c.hazardousKg, 0);
  const avgScore  = collectionHistory.length
    ? Math.round(collectionHistory.reduce((s, c) => s + c.segregationScore, 0) / collectionHistory.length)
    : 78;

  const kpiCards = [
    {
      icon: Leaf,
      label: 'CO₂ Saved',
      value: carbonWalletData.co2Saved,
      sub: 'lifetime impact',
      gradient: 'from-emerald-500 to-green-600',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      icon: Trash2,
      label: 'Waste Collected',
      value: `${totalWaste.toFixed(1)} kg`,
      sub: 'total diverted',
      gradient: 'from-sky-500 to-blue-600',
      lightBg: 'bg-sky-50',
      textColor: 'text-sky-600',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: `${carbonWalletData.streak} days`,
      sub: 'keep it going!',
      gradient: 'from-orange-500 to-amber-500',
      lightBg: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      icon: Zap,
      label: 'Credits This Month',
      value: `+${carbonWalletData.monthlyCredits}`,
      sub: 'carbon credits',
      gradient: 'from-violet-500 to-purple-600',
      lightBg: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
    {
      icon: CheckCircle,
      label: 'Segregation Score',
      value: `${avgScore}%`,
      sub: avgScore >= 80 ? 'excellent grade' : 'keep improving',
      gradient: 'from-teal-500 to-emerald-600',
      lightBg: 'bg-teal-50',
      textColor: 'text-teal-600',
    },
  ];

  return (
    <div className="space-y-7 stagger-fade-in">

      {/* ── Page Title ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-primary mb-1">Overview</p>
          <h1 className="text-3xl font-display font-bold text-foreground leading-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your personal waste &amp; carbon overview</p>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/60 px-3 py-1.5 rounded-full border border-border/60">
          <MapPin className="w-3 h-3 text-primary" />
          Indore, MP
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div
        className="relative rounded-3xl overflow-hidden grain-overlay"
        style={{ background: 'linear-gradient(135deg, #16A34A 0%, #15803D 40%, #0D5C2A 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #4ade80, transparent 70%)' }} />
        <div className="absolute -bottom-16 -left-10 w-72 h-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #86efac, transparent 70%)' }} />
        <div className="absolute top-4 right-56 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #bbf7d0, transparent 70%)' }} />

        <div className="relative z-10 p-7 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white/90 text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
              <Star className="w-3 h-3 fill-white/80" /> Carbon Credits Balance
            </div>
            <p className="text-6xl font-display font-bold text-white leading-none tracking-tight">
              {carbonWalletData.totalCredits.toLocaleString()}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1 text-emerald-200 text-sm font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                +{collectionHistory[0]?.creditsEarned ?? 0} from last collection
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <button
              onClick={() => navigate('/request-pickup')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
            >
              Request Pickup Now <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/carbon')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white/80 transition-all duration-200 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              View Wallet <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="card-premium p-4 group cursor-default">
            {/* Subtle top accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${kpi.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
            <div className={`w-10 h-10 rounded-xl ${kpi.lightBg} flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-4.5 h-4.5 ${kpi.textColor}`} />
            </div>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{kpi.label}</p>
            <p className="text-2xl font-display font-bold text-foreground mt-0.5">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* ── Left Column ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Next Pickup */}
          <div className="card-premium overflow-hidden">
            {/* coloured header strip */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ background: pickupRequests.length > 0
                ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderBottom: '1px solid hsl(var(--border) / 0.6)' }}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${pickupRequests.length > 0 ? 'bg-blue-100' : 'bg-secondary'}`}>
                  <Trash2 className={`w-4 h-4 ${pickupRequests.length > 0 ? 'text-blue-600' : 'text-muted-foreground'}`} />
                </div>
                <h3 className="font-display font-semibold text-foreground">Next Pickup</h3>
              </div>
              {pickupRequests.length > 0 ? (
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase ${
                  nextPickup.status === 'En Route' || nextPickup.status === 'Complete'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>{nextPickup.status}</span>
              ) : (
                <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold bg-secondary text-muted-foreground uppercase tracking-wide">None</span>
              )}
            </div>

            <div className="p-5">
              {pickupRequests.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {nextPickup.collector && (
                    <div className="bg-secondary/50 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Collector</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{nextPickup.collector}</p>
                    </div>
                  )}
                  {nextPickup.truckId && (
                    <div className="bg-secondary/50 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Truck ID</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{nextPickup.truckId}</p>
                    </div>
                  )}
                  <div className="bg-secondary/50 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Time Window</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{nextPickup.timeWindow}</p>
                  </div>
                  {nextPickup.eta && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] text-emerald-600 uppercase tracking-wide font-medium">ETA</p>
                      <p className="text-sm font-semibold text-emerald-700 mt-0.5">{nextPickup.eta}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary mx-auto mb-3 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No pickups scheduled.</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Request one to get started!</p>
                </div>
              )}
              <button
                onClick={() => navigate('/collection')}
                className="mt-4 flex items-center gap-1.5 text-primary text-sm font-semibold hover:gap-2.5 transition-all duration-200 group"
              >
                Track Live
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Recent Collections */}
          <div className="card-premium p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-foreground">Recent Collections</h3>
              <button
                onClick={() => navigate('/collection')}
                className="text-xs text-primary font-medium hover:underline"
              >
                View all
              </button>
            </div>
            <div className="space-y-2">
              {collectionHistory.slice(0, 3).map((c, idx) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 hover:border-border hover:bg-secondary/30 transition-all duration-150"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-glow flex items-center justify-center shrink-0">
                      <Leaf className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{c.date}</p>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-700 font-medium border border-teal-100">Wet {c.wetKg}kg</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium border border-amber-100">Dry {c.dryKg}kg</span>
                        {c.hazardousKg > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 font-medium border border-red-100">Haz {c.hazardousKg}kg</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      c.segregationScore >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {c.segregationScore}%
                    </span>
                    <span className="text-xs font-bold text-primary">+{c.creditsEarned} cr</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Quick Links */}
          <div className="card-premium p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-border/60 hover:border-border bg-card transition-all duration-200 hover:-translate-y-1 text-left group"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                    <link.icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-foreground leading-tight">{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Your Impact */}
          <div
            className="card-premium p-5 relative overflow-hidden grain-overlay"
            style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1a2e1a 50%, #0d1f2d 100%)' }}
          >
            {/* decorative orb */}
            <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #4ade80, transparent 70%)' }} />

            <div className="relative z-10">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-emerald-400 mb-1">Lifetime</p>
              <h3 className="font-display font-semibold text-white mb-5">Your Impact</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Leaf className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-lg font-display font-bold text-white">{carbonWalletData.treesSaved} trees</p>
                    <p className="text-[10px] text-white/50">equivalent trees saved</p>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-lg font-display font-bold text-white">{carbonWalletData.energySaved}</p>
                    <p className="text-[10px] text-white/50">energy saved</p>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-lg font-display font-bold text-white">{carbonWalletData.co2Saved}</p>
                    <p className="text-[10px] text-white/50">CO₂ offset</p>
                  </div>
                </div>
              </div>

              {/* Segregation score progress */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-white/60 font-medium">Avg. Segregation Score</span>
                  <span className="text-[11px] font-bold text-emerald-400">{avgScore}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${avgScore}%`,
                      background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
