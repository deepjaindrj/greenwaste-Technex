import { useState } from "react";
import { Recycle, Leaf, Droplets, Lightbulb, Package, FileText } from "lucide-react";
import { businessData } from "@/lib/mockData";

const entityTypes = ['Housing Society', 'Mall', 'Office', 'College', 'Restaurant'];
const iconMap: Record<string, React.ElementType> = { Recycle, Leaf, Droplets, Lightbulb, Package };
const scoreColor = (v: number) => v >= 75 ? 'text-primary' : v >= 50 ? 'text-warning' : 'text-destructive';

export default function Business() {
  const [entity, setEntity] = useState('Housing Society');

  return (
    <div className="max-w-7xl mx-auto space-y-6 stagger-fade-in">
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Business & ESG Dashboard</h1>
        <p className="text-sm text-muted-foreground">Sustainability metrics and compliance reporting</p>
      </div>

      {/* Entity selector */}
      <div className="flex rounded-full bg-secondary p-0.5 text-sm overflow-x-auto">
        {entityTypes.map(e => (
          <button key={e} onClick={() => setEntity(e)} className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-colors ${entity === e ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground'}`}>{e}</button>
        ))}
      </div>

      {/* Score Card */}
      <div className="card-premium p-6 text-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(214,32%,91%)" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(142,72%,37%)" strokeWidth="8" strokeDasharray={`${businessData.score * 3.27} 327`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-display font-bold text-foreground">{businessData.score}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>
        <p className={`text-lg font-display font-semibold ${scoreColor(businessData.score)}`}>Good</p>
        <div className="flex justify-center gap-6 mt-4">
          {businessData.subScores.map(s => (
            <div key={s.label} className="text-center">
              <p className={`text-lg font-display font-bold ${s.color === 'success' ? 'text-primary' : 'text-warning'}`}>{s.value}%</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Report Generator */}
      <div className="card-premium p-6">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">ESG Report Generator</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">One-click sustainability report for investors & compliance</p>
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Period</label>
            <select className="w-full h-9 px-3 rounded-full bg-surface border border-border text-sm text-foreground outline-none">
              <option>Last Month</option><option>Last Quarter</option><option>Last Year</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Format</label>
            <select className="w-full h-9 px-3 rounded-full bg-surface border border-border text-sm text-foreground outline-none">
              <option>PDF</option><option>Excel</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full btn-primary-gradient text-primary-foreground h-9 rounded-full text-sm font-medium">Generate Report →</button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">Your last report was generated 3 days ago · <span className="text-primary cursor-pointer">Download</span></p>
      </div>

      {/* Suggestions */}
      <div className="card-premium p-5">
        <h3 className="font-display font-semibold text-foreground mb-3">AI Sustainability Coach</h3>
        <div className="space-y-3">
          {businessData.suggestions.map((s, i) => {
            const Icon = iconMap[s.icon] || Leaf;
            return (
              <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-secondary/30 border border-border/50">
                <div className="w-9 h-9 rounded-xl bg-primary-glow flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.text}</p>
                  <div className="flex gap-4 mt-1 text-xs">
                    <span className="text-primary">{s.co2}</span>
                    <span className="text-accent">Save {s.savings}</span>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${s.priority === 'high' ? 'bg-destructive/10 text-destructive' : s.priority === 'medium' ? 'bg-warning/10 text-warning' : 'bg-primary-glow text-primary'}`}>{s.priority}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
