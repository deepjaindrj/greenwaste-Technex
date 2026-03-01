import { Star, Flame, ScanLine, Recycle, Download, Share2 } from "lucide-react";
import { rewardsData } from "@/lib/mockData";

const challengeIcons: Record<string, React.ElementType> = { Recycle, Flame, ScanLine };

function EcoPassport() {
  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-3">Your Eco Passport</h3>
      <div className="flex flex-col items-center gap-4">
        {/* Passport Card */}
        <div className="relative max-w-sm w-full grain-overlay rounded-3xl overflow-hidden" style={{ aspectRatio: '1.6', background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 50%, #0F9B3E 100%)' }}>
          {/* Decorative circles */}
          <div className="absolute top-4 right-8 w-24 h-24 rounded-full border border-white/10" />
          <div className="absolute bottom-8 left-4 w-16 h-16 rounded-full border border-white/5" />

          <div className="relative z-10 p-6 flex flex-col h-full justify-between">
            {/* Top */}
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-display font-semibold">🌍 WasteOS</span>
              <span className="text-white/60 text-[10px] font-mono uppercase tracking-wider">Eco Passport</span>
            </div>

            {/* Center */}
            <div className="flex flex-col items-center py-2">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border-[3px] border-white flex items-center justify-center text-xl font-display font-bold text-white mb-2">
                AM
              </div>
              <p className="text-white font-display font-semibold text-lg">Deep Jain</p>
              <p className="text-white/80 text-xs">Eco Champion 🏆</p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/20" />

            {/* Stats */}
            <div className="flex justify-between pt-2">
              <div className="text-center">
                <p className="text-white font-display font-bold text-lg">12,450</p>
                <p className="text-white/60 text-[10px]">Points</p>
              </div>
              <div className="text-center">
                <p className="text-white font-display font-bold text-lg">47</p>
                <p className="text-white/60 text-[10px]">Trees Saved</p>
              </div>
              <div className="text-center">
                <p className="text-white font-display font-bold text-lg">2.4t</p>
                <p className="text-white/60 text-[10px]">CO₂ Cut</p>
              </div>
            </div>

            {/* Bottom */}
            <p className="text-white/40 text-[9px] font-mono text-center mt-1">Member since Jan 2024</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="btn-secondary px-4 py-2 rounded-full text-xs flex items-center gap-1.5">
            <Share2 className="w-3 h-3" /> Share Your Impact
          </button>
          <button className="btn-secondary px-4 py-2 rounded-full text-xs flex items-center gap-1.5">
            <Download className="w-3 h-3" /> Download Card
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground">Share on Instagram, LinkedIn, or WhatsApp</p>
      </div>
    </div>
  );
}

export default function Rewards() {
  const { user, challenges, marketplace } = rewardsData;

  return (
    <div className="max-w-7xl mx-auto space-y-6 stagger-fade-in">
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Green Rewards</h1>
        <p className="text-sm text-muted-foreground">Earn points, complete challenges, redeem rewards</p>
      </div>

      {/* Eco Profile */}
      <div className="card-premium p-6 bg-gradient-to-br from-card to-primary-glow/30">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary-glow flex items-center justify-center text-2xl font-display font-bold text-primary">AM</div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-xl font-display font-semibold text-foreground">{user.name}</h2>
            <p className="text-sm text-primary font-medium mt-0.5">Eco Tier: {user.tier}</p>
            <div className="flex items-center gap-6 mt-3 justify-center md:justify-start">
              <div><span className="text-3xl font-display font-bold text-foreground">{user.lifetime.toLocaleString()}</span><span className="text-xs text-muted-foreground ml-1">pts lifetime</span></div>
              <div className="text-sm text-primary font-medium">+{user.monthly} this month</div>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
            {['Bronze', 'Silver', 'Gold', 'Platinum', 'Champion'].map(t => <span key={t}>{t}</span>)}
          </div>
          <div className="w-full h-1 bg-surface rounded-full overflow-hidden relative">
            <div className="h-full progress-bar-gradient transition-all duration-1000" style={{ width: `${user.tierProgress}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-card border-2 border-primary shadow-md pulse-glow" style={{ left: `${user.tierProgress}%`, transform: 'translate(-50%, -50%)' }} />
          </div>
        </div>
      </div>

      {/* Eco Passport */}
      <EcoPassport />

      {/* Challenges */}
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

      {/* Marketplace */}
      <div>
        <h3 className="font-display font-semibold text-foreground mb-3">Redeem Your Points</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketplace.map((item, i) => (
            <div key={i} className="card-premium p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-lg font-display font-bold text-muted-foreground shrink-0">
                {item.brand[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.offer}</p>
                <p className="text-xs text-primary font-medium mt-0.5">{item.points} pts</p>
              </div>
              <button className="btn-primary-gradient text-primary-foreground px-4 py-1.5 rounded-full text-xs font-medium shrink-0">Redeem</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}