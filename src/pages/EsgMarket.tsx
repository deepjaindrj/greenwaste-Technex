import { Recycle, Leaf, Droplets, Lightbulb, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { esgMarketData as mockEsg, businessData } from "@/lib/mockData";
import { useSupabaseQuery, useSupabaseMutation } from "@/hooks/use-supabase-query";
import { getEsgBuyers, getEsgTransactions, updateEsgBuyerStatus } from "@/lib/api";
import { normalizeEsgBuyers, normalizeEsgTxs, type EsgBuyerView } from "@/lib/normalize";

const iconMap: Record<string, React.ElementType> = { Recycle, Leaf, Droplets, Lightbulb, Package };
const scoreColor = (v: number) => v >= 75 ? 'text-primary' : v >= 50 ? 'text-warning' : 'text-destructive';

export default function EsgMarket() {
  const { data: buyersData } = useSupabaseQuery(['esg-buyers'], () => getEsgBuyers());
  const { data: txData } = useSupabaseQuery(['esg-transactions'], () => getEsgTransactions());

  const normalizedBuyers = buyersData ? normalizeEsgBuyers(buyersData) : (mockEsg.corporateBuyers as unknown as EsgBuyerView[]);
  const normalizedTxs = txData ? normalizeEsgTxs(txData) : mockEsg.recentTransactions;

  const esgMarketData = {
    ...mockEsg,
    recentTransactions: normalizedTxs,
  };

  const [buyers, setBuyers] = useState<EsgBuyerView[]>(normalizedBuyers);

  useEffect(() => {
    setBuyers(normalizedBuyers);
  }, [buyersData]);

  const approveMutation = useSupabaseMutation(
    async (vars: { id: number; status: string }) => updateEsgBuyerStatus(String(vars.id), vars.status as any),
    [['esg-buyers']],
  );

  const handleApprove = async (id: number) => {
    setBuyers(prev => prev.map(b => b.id === id ? { ...b, status: 'Approved' } : b));
    try { await approveMutation.mutateAsync({ id, status: 'Approved' }); } catch { /* optimistic */ }
  };

  const handleReject = async (id: number) => {
    setBuyers(prev => prev.map(b => b.id === id ? { ...b, status: 'Rejected' } : b));
    try { await approveMutation.mutateAsync({ id, status: 'Rejected' }); } catch { /* optimistic */ }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 stagger-fade-in">
      {/* Hero */}
      <div className="green-gradient grain-overlay rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden">
        <div className="z-10 relative">
          <p className="text-4xl font-display font-bold text-white">{esgMarketData.cityCreditsAvailable.toLocaleString()} City Credits Available</p>
          <p className="text-white/80 text-sm mt-1">Manage corporate carbon credit buyers</p>
        </div>
        <div className="z-10 relative flex gap-6 mt-4 md:mt-0">
          <div className="text-center">
            <p className="text-xl font-display font-bold text-white">{esgMarketData.revenueStats.creditsSold.toLocaleString()}</p>
            <p className="text-white/60 text-[10px]">Total Sold</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-display font-bold text-white">₹{esgMarketData.revenueStats.totalRevenue.toLocaleString()}</p>
            <p className="text-white/60 text-[10px]">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-display font-bold text-white">{esgMarketData.revenueStats.citizensPaid.toLocaleString()}</p>
            <p className="text-white/60 text-[10px]">Citizens Paid</p>
          </div>
        </div>
      </div>

      {/* Corporate Buyers Panel */}
      <div className="card-premium p-5">
        <h3 className="font-display font-semibold text-foreground mb-1">Corporate Buyers</h3>
        <p className="text-xs text-muted-foreground mb-4">Companies bidding for your city's carbon credits</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="text-left py-2 px-2">Company</th>
                <th className="text-right py-2 px-2">Credits</th>
                <th className="text-right py-2 px-2">₹/Credit</th>
                <th className="text-right py-2 px-2">Total</th>
                <th className="text-center py-2 px-2">Status</th>
                <th className="text-right py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map(buyer => (
                <tr key={buyer.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {buyer.company[0]}
                      </div>
                      <span className="font-medium text-foreground">{buyer.company}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-2 text-foreground">{buyer.creditsWanted.toLocaleString()}</td>
                  <td className="text-right py-3 px-2 text-foreground">₹{buyer.pricePerCredit.toFixed(2)}</td>
                  <td className="text-right py-3 px-2 font-medium text-foreground">₹{buyer.totalValue.toLocaleString()}</td>
                  <td className="text-center py-3 px-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      buyer.status === 'Approved' ? 'bg-primary-glow text-primary' :
                      buyer.status === 'Rejected' ? 'bg-destructive/10 text-destructive' :
                      'bg-warning/10 text-warning'
                    }`}>{buyer.status}</span>
                  </td>
                  <td className="text-right py-3 px-2">
                    {buyer.status === 'Pending' ? (
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => handleApprove(buyer.id)} className="btn-primary-gradient text-white px-3 py-1 rounded-full text-[10px] font-medium">Approve</button>
                        <button onClick={() => handleReject(buyer.id)} className="btn-secondary px-3 py-1 rounded-full text-[10px] font-medium">Reject</button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ESG Score Ring */}
      <div className="card-premium p-6 text-center">
        <h3 className="font-display font-semibold text-foreground mb-4">City ESG Score</h3>
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

      {/* Revenue Tracker */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Credits Sold', value: esgMarketData.revenueStats.creditsSold.toLocaleString() },
          { label: 'Revenue', value: `₹${esgMarketData.revenueStats.totalRevenue.toLocaleString()}` },
          { label: 'Citizens Paid', value: esgMarketData.revenueStats.citizensPaid.toLocaleString() },
          { label: 'Avg/Citizen', value: `₹${esgMarketData.revenueStats.avgPerCitizen}` },
        ].map(stat => (
          <div key={stat.label} className="card-premium p-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* AI Sustainability Coach */}
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

      {/* Recent Transactions */}
      <div className="card-premium p-5">
        <h3 className="font-display font-semibold text-foreground mb-3">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="text-left py-2 px-2">Company</th>
                <th className="text-right py-2 px-2">Credits</th>
                <th className="text-right py-2 px-2">Value</th>
                <th className="text-right py-2 px-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {esgMarketData.recentTransactions.map((t, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-2.5 px-2 font-medium text-foreground">{t.company}</td>
                  <td className="text-right py-2.5 px-2 text-foreground">{t.credits.toLocaleString()}</td>
                  <td className="text-right py-2.5 px-2 text-primary font-medium">₹{t.value.toLocaleString()}</td>
                  <td className="text-right py-2.5 px-2 text-muted-foreground">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
