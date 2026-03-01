import { Brain, Cpu } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { predictData, wasteTimelineData } from "@/lib/mockData";

export default function Predict() {
  const [horizon, setHorizon] = useState(7);
  const [confidence, setConfidence] = useState(85);
  const [sensitivity, setSensitivity] = useState(70);
  const [historical, setHistorical] = useState(60);

  const getHeatColor = (v: number) => {
    if (v < 25) return 'bg-primary-glow';
    if (v < 50) return 'bg-primary/20';
    if (v < 75) return 'bg-warning/20';
    return 'bg-destructive/20';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 stagger-fade-in">
      {/* Hero */}
      <div className="green-gradient grain-overlay rounded-2xl p-6 md:p-8 flex items-center justify-between overflow-hidden">
        <div className="z-10 relative">
          <h1 className="text-2xl font-display font-semibold text-primary-foreground">WasteOS Predictive Brain</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">AI-powered waste forecasting for smarter cities</p>
        </div>
        <div className="z-10 relative w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center pulse-glow">
          <Brain className="w-7 h-7 text-primary-foreground" />
        </div>
      </div>

      {/* AI Controls */}
      <div className="card-premium p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">AI Model Parameters</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Prediction Horizon', value: horizon, set: setHorizon, max: 30, unit: 'days' },
            { label: 'Confidence Threshold', value: confidence, set: setConfidence, max: 100, unit: '%' },
            { label: 'Zone Sensitivity', value: sensitivity, set: setSensitivity, max: 100, unit: '%' },
            { label: 'Historical Weight', value: historical, set: setHistorical, max: 100, unit: '%' },
          ].map(s => (
            <div key={s.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-foreground font-medium">{s.label}</span>
                <span className="font-mono text-primary text-sm">{s.value}{s.unit}</span>
              </div>
              <input type="range" min={1} max={s.max} value={s.value} onChange={e => s.set(Number(e.target.value))} className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md" />
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-5">
          <button className="btn-primary-gradient text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium">Recalculate →</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Heatmap Calendar */}
        <div className="card-premium p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Peak Waste Days Forecast</h3>
          <div className="grid grid-cols-7 gap-1.5">
            {['M','T','W','T','F','S','S'].map((d, i) => <div key={i} className="text-[10px] text-center text-muted-foreground font-medium">{d}</div>)}
            {predictData.heatmapCalendar.map((d) => (
              <div key={d.day} className={`aspect-square rounded-lg ${getHeatColor(d.value)} flex items-center justify-center text-xs font-medium text-foreground`}>
                {d.day}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 justify-center mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-glow" /> Low</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/20" /> Normal</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-warning/20" /> High</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-destructive/20" /> Critical</span>
          </div>
        </div>

        {/* Zone Forecast */}
        <div className="card-premium p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Zone-wise Forecast</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={predictData.zoneForecast} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(215,16%,62%)" />
              <YAxis dataKey="zone" type="category" tick={{ fontSize: 12 }} stroke="hsl(215,16%,62%)" width={60} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="predicted" fill="hsl(142,72%,37%)" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Waste Type Trends */}
      <div className="card-premium p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Waste Type Trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={wasteTimelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(215,16%,62%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,16%,62%)" />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Legend />
            <Line type="monotone" dataKey="recyclable" stroke="hsl(142,72%,37%)" strokeWidth={2} name="Plastic" />
            <Line type="monotone" dataKey="biodegradable" stroke="hsl(160,84%,39%)" strokeWidth={2} name="Food" />
            <Line type="monotone" dataKey="hazardous" stroke="hsl(0,84%,60%)" strokeWidth={2} name="Hazardous" />
            <Line type="monotone" dataKey="mixed" stroke="hsl(38,92%,50%)" strokeWidth={2} name="Mixed" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Predictions Feed */}
      <div className="card-premium p-5">
        <h3 className="font-display font-semibold text-foreground mb-3">AI Predictions Feed</h3>
        <div className="space-y-3">
          {predictData.predictions.map((p, i) => (
            <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-secondary/30 border border-border/50">
              <Cpu className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{p.text}</p>
                <p className="text-xs text-muted-foreground mt-1">Recommended: {p.action}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs font-mono text-primary">{p.confidence}%</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.impact === 'high' ? 'bg-destructive/10 text-destructive' : p.impact === 'medium' ? 'bg-warning/10 text-warning' : 'bg-primary-glow text-primary'}`}>{p.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
