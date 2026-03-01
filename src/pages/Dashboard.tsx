import { Rocket, ArrowRight, Trash2, CheckCircle, Leaf, Zap, RefreshCw, Brain, Camera, FileText, Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { kpiCards, wasteTimelineData, wasteComposition, aiInsights, quickActions } from "@/lib/mockData";
import { OnboardingModal } from "@/components/OnboardingModal";

const iconMap: Record<string, React.ElementType> = { Trash2, CheckCircle, Leaf, Zap, RefreshCw, Camera, FileText, Star, MapPin };

function KpiCard({ card }: { card: typeof kpiCards[0] }) {
  const Icon = iconMap[card.icon] || Leaf;
  const isPositiveTrend = card.id === 'waste-detected' ? card.trend < 0 : card.trend > 0;
  return (
    <div className="card-premium p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-primary-glow flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isPositiveTrend ? 'bg-primary-glow text-primary' : 'bg-destructive/10 text-destructive'}`}>
          {card.trend > 0 ? '↑' : '↓'} {Math.abs(card.trend)}{typeof card.trend === 'number' && card.trend % 1 !== 0 ? '%' : ''}
        </span>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{card.label}</p>
        <p className="text-2xl font-display font-bold text-foreground mt-0.5">{card.value}</p>
      </div>
      <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
        <div className="h-full progress-bar-gradient transition-all duration-1000" style={{ width: `${card.progress}%` }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
    <OnboardingModal />
    <div className="max-w-7xl mx-auto space-y-6 stagger-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">City Overview · Real-time</p>
      </div>

      {/* Green CTA Banner */}
      <div className="green-gradient grain-overlay rounded-2xl p-6 md:p-8 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-4 z-10 relative">
          <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
            <Rocket className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-display font-semibold text-primary-foreground">Open WasteOS AI Command</h2>
            <p className="text-primary-foreground/80 text-sm mt-0.5">City Intelligence · Predictive Engine · Carbon Strategy</p>
          </div>
        </div>
        <button onClick={() => navigate('/predict')} className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-foreground/20 backdrop-blur text-primary-foreground text-sm font-medium hover:bg-primary-foreground/30 transition-colors z-10 relative">
          Launch <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((card) => <KpiCard key={card.id} card={card} />)}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left - Charts */}
        <div className="lg:col-span-3 space-y-6">
          {/* Timeline Chart */}
          <div className="card-premium p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-foreground">Waste Detection Live</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Real-time segregation vs AI prediction</p>
              </div>
              <div className="flex rounded-full bg-secondary p-0.5 text-xs">
                <button className="px-3 py-1 rounded-full bg-card text-foreground font-medium shadow-sm">7 Days</button>
                <button className="px-3 py-1 rounded-full text-muted-foreground">30 Days</button>
                <button className="px-3 py-1 rounded-full text-muted-foreground">90 Days</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={wasteTimelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(215,16%,62%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,16%,62%)" />
                <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid hsl(214,32%,91%)', fontSize: 12 }} />
                <Area type="monotone" dataKey="recyclable" stackId="1" stroke="#16A34A" fill="#16A34A" fillOpacity={0.3} />
                <Area type="monotone" dataKey="biodegradable" stackId="1" stroke="hsl(160,84%,39%)" fill="hsl(160,84%,39%)" fillOpacity={0.2} />
                <Area type="monotone" dataKey="hazardous" stackId="1" stroke="hsl(0,84%,60%)" fill="hsl(0,84%,60%)" fillOpacity={0.2} />
                <Area type="monotone" dataKey="mixed" stackId="1" stroke="hsl(38,92%,50%)" fill="hsl(38,92%,50%)" fillOpacity={0.2} />
                <Area type="monotone" dataKey="predicted" stroke="hsl(215,16%,62%)" strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Map placeholder */}
          <div className="card-premium p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-foreground">Smart Waste Map — Mumbai</h3>
              <div className="flex rounded-full bg-secondary p-0.5 text-xs">
                <button className="px-3 py-1 rounded-full bg-card text-foreground font-medium shadow-sm">Present</button>
                <button className="px-3 py-1 rounded-full text-muted-foreground">2025</button>
                <button className="px-3 py-1 rounded-full text-muted-foreground">2030</button>
              </div>
            </div>
            <div className="relative w-full h-64 rounded-2xl bg-surface overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <div className="text-center z-10">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Mumbai, Maharashtra</p>
                <p className="text-xs text-muted-foreground">Interactive map loads here</p>
              </div>
              {/* Stats overlay */}
              <div className="absolute top-3 right-3 bg-card/90 backdrop-blur rounded-2xl p-3 border border-border text-xs space-y-1.5">
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Segregation</span><span className="font-semibold text-primary">78%</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Recycling</span><span className="font-semibold text-accent">62%</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Carbon Cut</span><span className="font-semibold text-primary">-12%</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Alerts</span><span className="font-semibold text-destructive">3</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Insights */}
          <div className="card-premium p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-foreground">AI Insight of the Day</h3>
            </div>
            <div className="space-y-3">
              {aiInsights.map((insight) => (
                <div key={insight.id} className="p-3 rounded-xl bg-secondary/50 border border-border/50 space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-foreground">{insight.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      insight.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                      insight.priority === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-primary-glow text-primary'
                    }`}>{insight.priority}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                  <div className="flex gap-3 text-[10px]">
                    <span className="text-primary font-medium">{insight.savings}</span>
                    <span className="text-accent font-medium">{insight.co2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Waste Composition */}
          <div className="card-premium p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Waste Composition</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={wasteComposition} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {wasteComposition.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid hsl(214,32%,91%)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {wasteComposition.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name} {item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-premium p-5">
            <h3 className="font-display font-semibold text-foreground mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {quickActions.map((action) => {
                const Icon = iconMap[action.icon] || Leaf;
                return (
                  <button key={action.label} onClick={() => navigate(action.route)} className="flex items-center gap-2.5 p-3 rounded-2xl border border-border hover:border-border-highlight transition-all duration-200 hover:-translate-y-0.5 text-left bg-card" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    <div className="w-9 h-9 rounded-xl bg-primary-glow flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}