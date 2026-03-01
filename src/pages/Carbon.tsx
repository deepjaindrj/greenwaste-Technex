import { TreePine, Trash2, Zap, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { carbonData } from "@/lib/mockData";

export default function Carbon() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 stagger-fade-in">
      {/* Hero */}
      <div className="green-gradient grain-overlay rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden">
        <div className="z-10 relative">
          <h1 className="text-2xl font-display font-semibold text-primary-foreground">Your Carbon Footprint</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">Track your environmental impact in real time</p>
        </div>
        <div className="z-10 relative text-center md:text-right mt-4 md:mt-0">
          <p className="text-4xl font-display font-bold text-primary-foreground">{carbonData.totalSaved}</p>
          <div className="flex items-center justify-center md:justify-end gap-1 mt-1">
            <TrendingUp className="w-4 h-4 text-primary-foreground/80" />
            <span className="text-primary-foreground/80 text-sm">CO₂ saved this month</span>
          </div>
        </div>
      </div>

      {/* Impact Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: TreePine, label: 'Trees Saved', value: `${carbonData.treesSaved} trees`, sub: "= 12 days of a home\u2019s electricity", color: 'text-primary' },
          { icon: Trash2, label: 'Landfill Avoided', value: carbonData.landfillAvoided, sub: "= 1 elephant\u2019s weight annually", color: 'text-accent' },
          { icon: Zap, label: 'Energy Equivalent', value: `${carbonData.energySaved} saved`, sub: '= powering 28 homes for a day', color: 'text-warning' },
        ].map(card => (
          <div key={card.label} className="card-premium p-6 text-center">
            <card.icon className={`w-10 h-10 mx-auto mb-3 ${card.color}`} />
            <p className="text-3xl font-display font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            <p className="text-[10px] text-muted-foreground mt-2">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Timeline Chart */}
      <div className="card-premium p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Carbon Reduction Journey</h3>
          <div className="flex rounded-full bg-secondary p-0.5 text-xs">
            {['Weekly', 'Monthly', 'Yearly'].map((t, i) => (
              <button key={t} className={`px-3 py-1 rounded-full ${i === 1 ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground'}`}>{t}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={carbonData.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215,16%,62%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,16%,62%)" />
            <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid hsl(214,32%,91%)', fontSize: 12 }} />
            <Area type="monotone" dataKey="saved" stroke="hsl(142,72%,37%)" fill="hsl(142,72%,37%)" fillOpacity={0.15} name="CO₂ Saved" />
            <Line type="monotone" dataKey="emitted" stroke="hsl(215,16%,62%)" strokeDasharray="5 5" name="CO₂ Emitted" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Carbon Debt Meter */}
      <div className="card-premium p-6">
        <h3 className="font-display font-semibold text-foreground mb-4">Your Carbon Debt to the Planet</h3>
        <div className="relative w-full h-8 rounded-full overflow-hidden bg-gradient-to-r from-destructive/20 via-warning/20 to-primary/20">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-destructive via-warning to-primary rounded-full" style={{ width: `${carbonData.debtPaidOff}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-card border-2 border-primary shadow-lg" style={{ left: `${carbonData.debtPaidOff}%`, transform: 'translate(-50%, -50%)' }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>In debt</span>
          <span>Carbon positive</span>
        </div>
        <p className="text-sm text-muted-foreground mt-3 text-center">You've paid off <span className="text-primary font-semibold">{carbonData.debtPaidOff}%</span> of your monthly carbon debt</p>
      </div>
    </div>
  );
}
