import { Trash2, CheckCircle, Truck, Cloud, RefreshCw, MapPin, AlertTriangle, Clock, Award, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { municipalData, carbonData } from "@/lib/mockData";

const kpiIcons: Record<string, React.ElementType> = { Trash2, CheckCircle, Truck, Cloud, RefreshCw };
const alertStyles: Record<string, { border: string; icon: React.ElementType }> = {
  overflow: { border: 'border-l-destructive', icon: AlertTriangle },
  segregation: { border: 'border-l-warning', icon: Trash2 },
  delay: { border: 'border-l-info', icon: Clock },
  milestone: { border: 'border-l-primary', icon: Award },
};
const statusColors: Record<string, string> = { Active: 'bg-primary-glow text-primary', Delayed: 'bg-warning/10 text-warning', Idle: 'bg-secondary text-muted-foreground' };

export default function Municipal() {
  const forecastChart = municipalData.forecast.flatMap(z => ['mon','tue','wed','thu','fri','sat','sun'].map(d => ({ zone: z.zone, day: d, value: z[d as keyof typeof z] as number })));
  const grouped = ['mon','tue','wed','thu','fri','sat','sun'].map(d => {
    const entry: Record<string, number | string> = { day: d };
    municipalData.forecast.forEach(z => { entry[z.zone] = z[d as keyof typeof z] as number; });
    return entry;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 stagger-fade-in">
      {/* Hero */}
      <div className="green-gradient grain-overlay rounded-2xl p-6 md:p-8 flex items-center justify-between overflow-hidden">
        <div className="z-10 relative">
          <h1 className="text-xl md:text-2xl font-display font-semibold text-primary-foreground">Municipal Command Center</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">City Intelligence · Route Optimization · Emissions Tracking</p>
        </div>
        <select className="z-10 relative px-4 py-2 rounded-full bg-primary-foreground/20 backdrop-blur text-primary-foreground text-sm border-none outline-none cursor-pointer">
          <option>Mumbai</option><option>Delhi</option><option>Pune</option>
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {municipalData.kpis.map(kpi => {
          const Icon = kpiIcons[kpi.icon] || Trash2;
          return (
            <div key={kpi.label} className="card-premium p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-primary" />
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${kpi.trend < 0 ? 'bg-primary-glow text-primary' : kpi.trend > 0 ? 'bg-warning/10 text-warning' : 'bg-secondary text-muted-foreground'}`}>
                  {kpi.trend > 0 ? '↑' : kpi.trend < 0 ? '↓' : '−'}{Math.abs(kpi.trend)}%
                </span>
              </div>
              <p className="text-xl font-display font-bold text-foreground">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Map */}
        <div className="lg:col-span-3 card-premium p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Smart Waste Map — Mumbai</h3>
          <div className="relative w-full h-80 rounded-2xl bg-surface flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <MapPin className="w-8 h-8 text-primary z-10" />
            {/* Floating circles */}
            {[{ x: 25, y: 30, s: 40, c: 'bg-destructive/20' }, { x: 60, y: 50, s: 30, c: 'bg-warning/20' }, { x: 45, y: 70, s: 50, c: 'bg-primary/20' }, { x: 75, y: 35, s: 25, c: 'bg-primary/15' }].map((c, i) => (
              <div key={i} className={`absolute rounded-full ${c.c}`} style={{ left: `${c.x}%`, top: `${c.y}%`, width: c.s, height: c.s, transform: 'translate(-50%,-50%)' }} />
            ))}
          </div>
        </div>

        {/* Alerts + Trucks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-premium p-5">
            <h3 className="font-display font-semibold text-foreground mb-3">Live Alerts</h3>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {municipalData.alerts.map((alert, i) => {
                const style = alertStyles[alert.type] || alertStyles.milestone;
                const Icon = style.icon;
                return (
                  <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg border-l-2 ${style.border} bg-secondary/30`}>
                    <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">{alert.title}</p>
                      <p className="text-[10px] text-muted-foreground">{alert.location} · {alert.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card-premium p-5">
            <h3 className="font-display font-semibold text-foreground mb-3">Truck Fleet Status</h3>
            <div className="space-y-2">
              {municipalData.trucks.map(truck => (
                <div key={truck.id} className="flex items-center justify-between text-xs py-1.5">
                  <span className="font-mono font-medium text-foreground">{truck.id}</span>
                  <span className="text-muted-foreground">{truck.zone}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[truck.status]}`}>{truck.status}</span>
                  <span className="text-muted-foreground">{truck.collected}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 btn-primary-gradient text-primary-foreground py-2 rounded-full text-xs font-medium">Optimize Routes →</button>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="card-premium p-5">
        <h3 className="font-display font-semibold text-foreground mb-1">Predictive Overflow Forecast</h3>
        <p className="text-xs text-muted-foreground mb-4">Waste generation forecast for next 7 days per zone</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={grouped}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(215,16%,62%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,16%,62%)" />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(214,32%,91%)', fontSize: 12 }} />
            <Bar dataKey="Zone 1" fill="hsl(142,72%,37%)" radius={[4,4,0,0]} />
            <Bar dataKey="Zone 2" fill="hsl(160,84%,39%)" radius={[4,4,0,0]} />
            <Bar dataKey="Zone 3" fill="hsl(38,92%,50%)" radius={[4,4,0,0]} />
            <Bar dataKey="Zone 4" fill="hsl(0,84%,60%)" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 p-3 rounded-xl bg-primary-glow/50 border border-primary/10">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-foreground"><span className="font-medium">AI Insight:</span> Zone 4-B predicted to overflow Saturday. Recommend 2 additional pickups.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
