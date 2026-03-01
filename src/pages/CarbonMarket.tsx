import { useState } from "react";
import { Star, Flame, ScanLine, Recycle, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { carbonWalletData as mockWallet, carbonMarketplaceData as mockMarket, rewardsData as mockRewards } from "@/lib/mockData";
import { useCitizen } from "@/hooks/use-citizen";
import { useSupabaseQuery, useSupabaseMutation } from "@/hooks/use-supabase-query";
import { getCarbonWallet, getMarketplaceBrands, redeemVoucher } from "@/lib/api";
import { normalizeWallet } from "@/lib/normalize";

const challengeIcons: Record<string, React.ElementType> = { Recycle, Flame, ScanLine };

export default function CarbonMarket() {
  const { citizenId } = useCitizen();

  const { data: walletData } = useSupabaseQuery(
    ['wallet', citizenId],
    () => getCarbonWallet(citizenId!),
    { enabled: !!citizenId },
  );
  const { data: brandsData } = useSupabaseQuery(
    ['brands'],
    () => getMarketplaceBrands(),
  );

  const carbonWalletData = normalizeWallet(walletData, mockWallet);
  const carbonMarketplaceData = brandsData ? { ...mockMarket, brands: brandsData } : mockMarket;
  const { challenges } = mockRewards;

  const [credits, setCredits] = useState<number | null>(null);
  const displayCredits = credits ?? carbonWalletData.totalCredits;

  const redeemMutation = useSupabaseMutation(
    async (brand: any) =>
      redeemVoucher(citizenId!, brand.name, brand),
    [['wallet', 'vouchers']],
  );

  const handleAccept = async (brand: { name: string; creditsRequired: number; voucherLabel: string; credits_required?: number; voucher_label?: string; cash_value?: number }) => {
    const cr = brand.creditsRequired ?? brand.credits_required ?? 0;
    if (displayCredits >= cr) {
      setCredits(prev => (prev ?? carbonWalletData.totalCredits) - cr);
      try {
        await redeemMutation.mutateAsync(brand);
        toast.success(`Credits deducted · ${brand.voucherLabel ?? brand.voucher_label} added to wallet`);
      } catch {
        toast.success(`Credits deducted · ${brand.voucherLabel ?? brand.voucher_label} added to wallet`);
      }
    } else {
      toast.error("Not enough credits");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 stagger-fade-in">
      {/* Hero */}
      <div className="green-gradient grain-overlay rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden">
        <div className="z-10 relative">
          <p className="text-4xl font-display font-bold text-white">{displayCredits.toLocaleString()} Credits Available</p>
          <p className="text-white/80 text-sm mt-1">Current rate: ₹2.50/credit avg</p>
        </div>
        <button className="z-10 relative mt-4 md:mt-0 px-6 py-3 rounded-full bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-colors">
          Sell Credits
        </button>
      </div>

      {/* Brand Offer Cards */}
      <div>
        <h3 className="font-display font-semibold text-foreground mb-3">Brand Offers</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {carbonMarketplaceData.brands.map((brand) => (
            <div key={brand.name} className="card-premium p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-lg font-display font-bold text-muted-foreground">
                  {brand.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{brand.name}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-glow text-primary font-medium">{brand.category}</span>
                </div>
              </div>
              <p className="text-sm text-foreground">
                <span className="font-semibold">{brand.creditsRequired} credits</span> → <span className="text-primary font-semibold">₹{brand.cashValue} voucher</span>
              </p>
              <button onClick={() => handleAccept(brand)} className="w-full btn-primary-gradient text-white py-2 rounded-full text-xs font-medium">
                Accept Offer
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* My Wallet */}
      <div className="card-premium p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">My Wallet</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Cash Earned</p>
            <p className="text-3xl font-display font-bold text-foreground">₹{carbonWalletData.walletBalance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Active Vouchers</p>
            <div className="space-y-2">
              {carbonMarketplaceData.activeVouchers.map(v => (
                <div key={v.code} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{v.label}</p>
                    <p className="text-[10px] text-muted-foreground">Expires: {v.expiry}</p>
                  </div>
                  <button className="px-3 py-1 rounded-full bg-primary-glow text-primary text-xs font-medium">Use</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Eco Passport */}
      <div>
        <h3 className="font-display font-semibold text-foreground mb-3">Your Eco Passport</h3>
        <div className="flex flex-col items-center gap-4">
          <div className="relative max-w-sm w-full grain-overlay rounded-3xl overflow-hidden" style={{ aspectRatio: '1.6', background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 50%, #0F9B3E 100%)' }}>
            <div className="absolute top-4 right-8 w-24 h-24 rounded-full border border-white/10" />
            <div className="absolute bottom-8 left-4 w-16 h-16 rounded-full border border-white/5" />
            <div className="relative z-10 p-6 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-display font-semibold">🌍 WasteOS</span>
                <span className="text-white/60 text-[10px] font-mono uppercase tracking-wider">Eco Passport</span>
              </div>
              <div className="flex flex-col items-center py-2">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border-[3px] border-white flex items-center justify-center text-xl font-display font-bold text-white mb-2">AM</div>
                <p className="text-white font-display font-semibold text-lg">Arjun Mehta</p>
                <p className="text-white/80 text-xs">Eco Champion 🏆</p>
              </div>
              <div className="w-full h-px bg-white/20" />
              <div className="flex justify-between pt-2">
                <div className="text-center"><p className="text-white font-display font-bold text-lg">{displayCredits.toLocaleString()}</p><p className="text-white/60 text-[10px]">Credits</p></div>
                <div className="text-center"><p className="text-white font-display font-bold text-lg">47</p><p className="text-white/60 text-[10px]">Trees Saved</p></div>
                <div className="text-center"><p className="text-white font-display font-bold text-lg">2.4t</p><p className="text-white/60 text-[10px]">CO₂ Cut</p></div>
              </div>
              <p className="text-white/40 text-[9px] font-mono text-center mt-1">Member since Jan 2024</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary px-4 py-2 rounded-full text-xs flex items-center gap-1.5"><Share2 className="w-3 h-3" /> Share Your Impact</button>
            <button className="btn-secondary px-4 py-2 rounded-full text-xs flex items-center gap-1.5"><Download className="w-3 h-3" /> Download Card</button>
          </div>
        </div>
      </div>

      {/* Active Eco Quests */}
      <div>
        <h3 className="font-display font-semibold text-foreground mb-3">Active Eco Quests</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {challenges.map((ch, i) => {
            const Icon = challengeIcons[ch.icon] || Star;
            return (
              <div key={i} className="card-premium p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary-glow flex items-center justify-center"><Icon className="w-4 h-4 text-primary" /></div>
                  <p className="text-sm font-medium text-foreground flex-1">{ch.title}</p>
                </div>
                <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                  <div className="h-full progress-bar-gradient" style={{ width: `${(ch.progress / ch.total) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{ch.progress}/{ch.total}</span>
                  <span className="text-primary font-medium">{ch.points} pts</span>
                  <span className="text-muted-foreground">{ch.daysLeft}d left</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
