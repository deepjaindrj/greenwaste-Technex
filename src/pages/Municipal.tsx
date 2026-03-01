import { Trash2, CheckCircle, Truck, Cloud, RefreshCw, AlertTriangle, Clock, Award, TrendingUp } from "lucide-react";
import LeafletMap from "@/components/LeafletMap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useState, useEffect } from "react";
import { municipalData as mockMunicipal, carbonData, municipalPickupQueue as mockQueue } from "@/lib/mockData";
import { useSupabaseQuery, useSupabaseMutation } from "@/hooks/use-supabase-query";
import { getMunicipalQueue, getMunicipalAlerts, getZones, getTrucks, getZoneForecast, assignTruckToQueue, subscribeMunicipalQueue } from "@/lib/api";
import { normalizeQueue, normalizeForecast, type QueueView } from "@/lib/normalize";

const kpiIcons: Record<string, React.ElementType> = { Trash2, CheckCircle, Truck, Cloud, RefreshCw };
const alertStyles: Record<string, { border: string; icon: React.ElementType }> = {
  overflow: { border: 'border-l-destructive', icon: AlertTriangle },
  segregation: { border: 'border-l-warning', icon: Trash2 },
  delay: { border: 'border-l-info', icon: Clock },
  milestone: { border: 'border-l-primary', icon: Award },
};
const statusColors: Record<string, string> = { Active: 'bg-primary-glow text-primary', Delayed: 'bg-warning/10 text-warning', Idle: 'bg-secondary text-muted-foreground' };

const wasteTypeColors: Record<string, string> = {
  Mixed: 'bg-primary-glow text-primary',
  Dry: 'bg-warning/10 text-warning',
  Wet: 'bg-accent/10 text-accent',
  Hazardous: 'bg-destructive/10 text-destructive',
};

const truckIds = ['MP-201', 'MP-215', 'MP-247', 'MP-289', 'MP-302'];

export default function Municipal() {
  const { data: queueData, refetch: refetchQueue } = useSupabaseQuery(['municipal-queue'], () => getMunicipalQueue(), { refetchInterval: 15000 });
  const { data: alertsData } = useSupabaseQuery(['municipal-alerts'], () => getMunicipalAlerts());
  const { data: trucksData } = useSupabaseQuery(['trucks'], () => getTrucks());
  const { data: forecastData } = useSupabaseQuery(['forecast'], () => getZoneForecast());

  // Realtime subscription for queue changes
  useEffect(() => {
    const channel = subscribeMunicipalQueue('Indore', () => { refetchQueue(); });
    return () => { channel.unsubscribe(); };
  }, [refetchQueue]);

  // Build truck IDs from DB data, fallback to hardcoded
  const availableTruckIds = trucksData && trucksData.length > 0
    ? trucksData.map((t: any) => t.id)
    : truckIds;

  const municipalData = {
    ...mockMunicipal,
    alerts: alertsData ?? mockMunicipal.alerts,
    trucks: trucksData ?? mockMunicipal.trucks,
    forecast: forecastData ? normalizeForecast(forecastData) : mockMunicipal.forecast,
  };

  const [pickupQueue, setPickupQueue] = useState<QueueView[]>(() =>
    queueData ? normalizeQueue(queueData) : (mockQueue as unknown as QueueView[])
  );

  useEffect(() => {
    if (queueData) setPickupQueue(normalizeQueue(queueData));
  }, [queueData]);

  const assignMutation = useSupabaseMutation(
    async (vars: { reqId: string; truckId: string }) => assignTruckToQueue(vars.reqId, vars.truckId),
    [['municipal-queue']],
  );

  const handleAssignTruck = async (reqId: string) => {
    const randomTruck = availableTruckIds[Math.floor(Math.random() * availableTruckIds.length)];
    setPickupQueue(prev => prev.map(r => r.id === reqId ? { ...r, assignedTruck: randomTruck } : r));
    try { await assignMutation.mutateAsync({ reqId, truckId: randomTruck }); } catch { /* optimistic */ }
  };

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
          <option>Indore</option><option>Bhopal</option><option>Ujjain</option>
        </select>
      </div>

      {/* Incoming Pickup Requests */}
      <div className="card-premium p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display font-semibold text-foreground">Incoming Pickup Requests</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-glow text-primary font-medium">{pickupQueue.length}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Live citizen requests awaiting assignment</p>
        <div className="space-y-2">
          {pickupQueue.map(req => (
            <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{req.citizenName}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${wasteTypeColors[req.wasteType] || 'bg-secondary text-muted-foreground'}`}>{req.wasteType}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{req.address}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-muted-foreground">{req.minutesAgo} min ago</span>
                {req.assignedTruck ? (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-primary-glow text-primary font-medium">{req.assignedTruck}</span>
                ) : (
                  <button onClick={() => handleAssignTruck(req.id)} className="btn-primary-gradient text-white px-3 py-1 rounded-full text-[10px] font-medium">Assign Truck</button>
                )}
              </div>
            </div>
          ))}
        </div>
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
          <h3 className="font-display font-semibold text-foreground mb-4">Smart Waste Map — Indore</h3>
          <div className="w-full h-80 rounded-2xl overflow-hidden">
            <LeafletMap
              center={[22.7196, 75.8577]}
              zoom={13}
              markers={[
                { lat: 22.7533, lng: 75.8937, label: 'Zone 4 — Vijay Nagar' },
                { lat: 22.7236, lng: 75.8577, label: 'Zone 2 — Palasia' },
                { lat: 22.7186, lng: 75.8572, label: 'Zone 1 — Rajwada' },
                { lat: 22.7465, lng: 75.8885, label: 'Zone 3 — Scheme 78' },
              ]}
            />
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
