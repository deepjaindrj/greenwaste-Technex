import { TreePine, Trash2, Zap, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { carbonWalletData as mockWallet, collectionHistory as mockHistory } from "@/lib/mockData";
import { useCitizen } from "@/hooks/use-citizen";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { getCarbonWallet, getCarbonMonthlyChart, getCollectionHistory } from "@/lib/api";
import { normalizeWallet, normalizeCollections } from "@/lib/normalize";

export default function Carbon() {
  const navigate = useNavigate();
  const { citizenId } = useCitizen();

  const { data: walletRaw } = useSupabaseQuery(
    ['wallet', citizenId],
    () => getCarbonWallet(citizenId!),
    { enabled: !!citizenId },
  );
  const { data: monthlyRaw } = useSupabaseQuery(
    ['wallet-monthly', citizenId],
    () => getCarbonMonthlyChart(citizenId!),
    { enabled: !!citizenId },
  );
  const { data: collectionsRaw } = useSupabaseQuery(
    ['collections', citizenId],
    () => getCollectionHistory(citizenId!),
    { enabled: !!citizenId },
  );

  const carbonWalletData = normalizeWallet(walletRaw, mockWallet);
  // Merge monthly chart from dedicated endpoint
  if (monthlyRaw && monthlyRaw.length) {
    carbonWalletData.monthlyChart = monthlyRaw.map((m: any) => ({ month: m.month, credits: m.credits }));
  }
  const collectionHistory = collectionsRaw ? normalizeCollections(collectionsRaw) : mockHistory;

  return (
    <div className="max-w-7xl mx-auto space-y-6 stagger-fade-in">
      {/* Hero */}
      <div className="green-gradient grain-overlay rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden">
        <div className="z-10 relative">
          <h1 className="text-2xl font-display font-semibold text-primary-foreground">Carbon Wallet</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">Your carbon credit earnings and impact</p>
        </div>
        <div className="z-10 relative text-center md:text-right mt-4 md:mt-0">
          <p className="text-4xl font-display font-bold text-primary-foreground">{carbonWalletData.totalCredits.toLocaleString()} Credits</p>
          <div className="flex items-center justify-center md:justify-end gap-2 mt-2">
            <span className="text-primary-foreground/80 text-sm">+{carbonWalletData.thisMonth} this month vs +{carbonWalletData.lastMonth} last month</span>
          </div>
          <button onClick={() => navigate('/marketplace')} className="mt-3 px-5 py-2 rounded-full bg-white text-primary text-sm font-medium hover:bg-white/90 transition-colors inline-flex items-center gap-2">
            Sell Credits <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Impact Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: TreePine, label: 'Trees Saved', value: `${carbonWalletData.treesSaved} trees`, sub: "= 12 days of a home\u2019s electricity", color: 'text-primary' },
          { icon: Trash2, label: 'CO₂ Saved', value: carbonWalletData.co2Saved, sub: "= 1 elephant\u2019s weight annually", color: 'text-accent' },
          { icon: Zap, label: 'Energy Equivalent', value: `${carbonWalletData.energySaved} saved`, sub: '= powering 28 homes for a day', color: 'text-warning' },
        ].map(card => (
          <div key={card.label} className="card-premium p-6 text-center">
            <card.icon className={`w-10 h-10 mx-auto mb-3 ${card.color}`} />
            <p className="text-3xl font-display font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            <p className="text-[10px] text-muted-foreground mt-2">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Collection History Table */}
      <div className="card-premium p-5">
        <h3 className="font-display font-semibold text-foreground mb-3">Collection History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="text-left py-2 px-2">Date</th>
                <th className="text-right py-2 px-2">Wet kg</th>
                <th className="text-right py-2 px-2">Dry kg</th>
                <th className="text-right py-2 px-2">Haz kg</th>
                <th className="text-center py-2 px-2">Score</th>
                <th className="text-right py-2 px-2">Credits</th>
              </tr>
            </thead>
            <tbody>
              {collectionHistory.map(c => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-2.5 px-2 font-medium text-foreground">{c.date}</td>
                  <td className="text-right py-2.5 px-2 text-foreground">{c.wetKg}</td>
                  <td className="text-right py-2.5 px-2 text-foreground">{c.dryKg}</td>
                  <td className="text-right py-2.5 px-2 text-foreground">{c.hazardousKg}</td>
                  <td className="text-center py-2.5 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.segregationScore >= 80 ? 'bg-primary-glow text-primary' : 'bg-warning/10 text-warning'}`}>
                      {c.segregationScore}%
                    </span>
                  </td>
                  <td className="text-right py-2.5 px-2">
                    <span className="text-xs font-medium text-primary bg-primary-glow px-2 py-0.5 rounded-full">+{c.creditsEarned}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credits Over Time Chart */}
      <div className="card-premium p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Credits Earned Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={carbonWalletData.monthlyChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215,16%,62%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,16%,62%)" />
            <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid hsl(214,32%,91%)', fontSize: 12 }} />
            <Area type="monotone" dataKey="credits" stroke="hsl(142,72%,37%)" fill="hsl(142,72%,37%)" fillOpacity={0.15} name="Credits Earned" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
