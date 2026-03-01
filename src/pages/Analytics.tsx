import { TrendingUp, Cpu } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { wasteTimelineData as mockTimeline, municipalData as mockMunicipal, predictData as mockPredict, esgMarketData as mockEsg } from "@/lib/mockData";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { getWasteTimeline, getAiPredictions, getZoneForecast, getEsgBuyers } from "@/lib/api";
import { normalizeTimeline, normalizeForecast, normalizePredictData } from "@/lib/normalize";

const getHeatColor = (v: number) => {
  if (v < 25) return 'bg-primary-glow';
  if (v < 50) return 'bg-primary/20';
  if (v < 75) return 'bg-warning/20';
  return 'bg-destructive/20';
};

export default function Analytics() {
  const { data: timelineData } = useSupabaseQuery(['waste-timeline'], () => getWasteTimeline());
  const { data: predictionsData } = useSupabaseQuery(['predictions'], () => getAiPredictions());
  const { data: forecastData } = useSupabaseQuery(['forecast'], () => getZoneForecast());
  const { data: esgBuyers } = useSupabaseQuery(['esg-buyers'], () => getEsgBuyers());

  const wasteTimelineData = timelineData ? normalizeTimeline(timelineData) : mockTimeline;
  const predictData = normalizePredictData(predictionsData, mockPredict);
  const municipalData = { ...mockMunicipal, forecast: forecastData ? normalizeForecast(forecastData) : mockMunicipal.forecast };
  const esgMarketData = { ...mockEsg, corporateBuyers: esgBuyers ?? mockEsg.corporateBuyers };

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
          <h1 className="text-2xl font-display font-semibold text-primary-foreground">City Analytics</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">Comprehensive waste intelligence and trends</p>
        </div>
        <div className="z-10 relative w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <TrendingUp className="w-7 h-7 text-primary-foreground" />
        </div>
      </div>

      {/* City Waste Composition AreaChart */}
      <div className="card-premium p-5">
        <h3 className="font-display font-semibold text-foreground mb-1">City Waste Composition</h3>
        <p className="text-xs text-muted-foreground mb-4">Stacked waste type breakdown over time</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={wasteTimelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(215,16%,62%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,16%,62%)" />
            <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid hsl(214,32%,91%)', fontSize: 12 }} />
            <Area type="monotone" dataKey="recyclable" stackId="1" stroke="#16A34A" fill="#16A34A" fillOpacity={0.3} />
            <Area type="monotone" dataKey="biodegradable" stackId="1" stroke="hsl(160,84%,39%)" fill="hsl(160,84%,39%)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="hazardous" stackId="1" stroke="hsl(0,84%,60%)" fill="hsl(0,84%,60%)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="mixed" stackId="1" stroke="hsl(38,92%,50%)" fill="hsl(38,92%,50%)" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two-column grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Zone-wise BarChart */}
        <div className="card-premium p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Zone-wise Waste Forecast</h3>
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
        </div>

        {/* Segregation Compliance Heatmap */}
        <div className="card-premium p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Segregation Compliance Heatmap</h3>
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
      </div>

      {/* Carbon Credit Economy */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'Credits Issued', value: esgMarketData.cityCreditsAvailable.toLocaleString() },
          { label: 'Credits Sold', value: esgMarketData.revenueStats.creditsSold.toLocaleString() },
          { label: 'Revenue Generated', value: `₹${esgMarketData.revenueStats.totalRevenue.toLocaleString()}` },
        ].map(stat => (
          <div key={stat.label} className="card-premium p-5 text-center">
            <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
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
