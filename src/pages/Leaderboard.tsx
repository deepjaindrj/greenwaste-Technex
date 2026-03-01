import { useState } from "react";
import { Search, Trophy, Swords } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { leaderboardData } from "@/lib/mockData";

const mainTabs = ['Rankings', 'Challenges', 'History'];
const scopeTabs = ['Society', 'City', 'State', 'National'];
const timeframes = ['Weekly', 'Monthly', 'All-time'];

const availableChallenges = [
  { name: 'Zero Waste Week', icon: '♻️', societies: 12, prize: '5,000 bonus pts + Trophy', entry: '500 pts', desc: 'Achieve zero mixed waste for 7 consecutive days' },
  { name: 'Carbon Champions Cup', icon: '🌍', societies: 8, prize: '10,000 pts + City Award', entry: '1,000 pts', desc: 'Highest collective CO₂ savings in 30 days' },
  { name: 'Recycling Relay', icon: '🔄', societies: 15, prize: '3,000 pts + Badges', entry: '200 pts', desc: 'Recycle 500kg collectively as a society' },
];

const pastWinners = [
  { month: 'September 2024', winner: 'Green Valley Apts', points: '34,200', prize: 'City Trophy' },
  { month: 'August 2024', winner: 'EcoNest Society', points: '31,800', prize: '10,000 pts' },
  { month: 'July 2024', winner: 'SunRise Tower', points: '28,400', prize: 'City Trophy' },
];

export default function Leaderboard() {
  const [mainTab, setMainTab] = useState('Rankings');
  const [tab, setTab] = useState('Society');
  const [timeframe, setTimeframe] = useState('Monthly');
  const [search, setSearch] = useState('');

  const top3 = leaderboardData.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]];

  return (
    <div className="max-w-5xl mx-auto space-y-6 stagger-fade-in">
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Carbon Earners</h1>
        <p className="text-sm text-muted-foreground">Top carbon credit earners in your city</p>
      </div>

      {/* Main Tabs */}
      <div className="flex rounded-full bg-secondary p-0.5 text-sm w-fit">
        {mainTabs.map(t => (
          <button key={t} onClick={() => setMainTab(t)} className={`px-4 py-1.5 rounded-full transition-colors ${mainTab === t ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground'}`}>{t}</button>
        ))}
      </div>

      {/* RANKINGS TAB */}
      {mainTab === 'Rankings' && (
        <>
          <div className="flex rounded-full bg-secondary p-0.5 text-sm w-fit">
            {scopeTabs.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full transition-colors ${tab === t ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground'}`}>{t}</button>
            ))}
          </div>

          {/* Podium */}
          <div className="flex items-end justify-center gap-4 py-6">
            {podiumOrder.map((user, i) => {
              const heights = [120, 160, 100];
              const isFirst = i === 1;
              return (
                <div key={user.rank} className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-display font-bold mb-2 ${isFirst ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-secondary text-foreground'}`}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <p className="text-sm font-medium text-foreground">{user.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-muted-foreground mb-2">{user.points.toLocaleString()} pts</p>
                  <div className={`w-20 rounded-t-xl flex items-center justify-center text-2xl ${isFirst ? 'bg-primary/10' : 'bg-secondary'}`} style={{ height: heights[i] }}>
                    {user.badge}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full h-9 pl-9 pr-4 rounded-full bg-surface text-sm border-none outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="flex rounded-full bg-secondary p-0.5 text-xs">
              {timeframes.map(t => (
                <button key={t} onClick={() => setTimeframe(t)} className={`px-3 py-1 rounded-full ${timeframe === t ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground'}`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="card-premium overflow-hidden">
            <div className="grid grid-cols-[40px_1fr_1fr_1fr_80px_60px] gap-3 px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
              <span>#</span><span>Name</span><span>Society</span><span>City</span><span>Points</span><span>Trend</span>
            </div>
            {leaderboardData.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).map(user => (
              <div key={user.rank} className={`grid grid-cols-[40px_1fr_1fr_1fr_80px_60px] gap-3 px-4 py-3 items-center text-sm border-b border-border/50 ${user.rank <= 3 ? 'bg-primary-glow/30' : user.isUser ? 'bg-primary-glow/50' : 'hover:bg-secondary/30'} transition-colors`}>
                <span className="font-display font-bold text-foreground">{user.badge || user.rank}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-semibold text-foreground shrink-0">{user.name.split(' ').map(n => n[0]).join('')}</div>
                  <span className="font-medium text-foreground truncate">{user.name}{user.isUser && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">You</span>}</span>
                </div>
                <span className="text-muted-foreground truncate">{user.society}</span>
                <span className="text-muted-foreground">{user.city}</span>
                <span className="font-mono font-medium text-foreground">{user.points.toLocaleString()}</span>
                <div className="w-14 h-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={user.trend.map((v, i) => ({ v, i }))}>
                      <Line type="monotone" dataKey="v" stroke="hsl(142,72%,37%)" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CHALLENGES TAB */}
      {mainTab === 'Challenges' && (
        <div className="space-y-6">
          {/* Active Challenge Banner */}
          <div className="green-gradient grain-overlay rounded-2xl p-6 overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Swords className="w-5 h-5 text-white" />
                <h3 className="font-display font-semibold text-white text-lg">Monthly Challenge — October 2024</h3>
              </div>
              <p className="text-white/80 text-sm mb-5">Andheri East vs Bandra West</p>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-white/80 mb-1">
                    <span>Andheri East</span>
                    <span className="font-mono">8,420 pts</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '56%' }} />
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary font-display font-bold text-sm shrink-0">VS</div>

                <div className="flex-1">
                  <div className="flex justify-between text-xs text-white/80 mb-1">
                    <span>Bandra West</span>
                    <span className="font-mono">7,890 pts</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white/80 rounded-full" style={{ width: '52%' }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-white/70 text-xs">12 days left</span>
                <button className="px-5 py-2 rounded-full bg-white text-primary text-sm font-medium hover:bg-white/90 transition-colors">Join Challenge</button>
              </div>
            </div>
          </div>

          {/* Available Challenges */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-3">Available Challenges</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {availableChallenges.map((ch, i) => (
                <div key={i} className="card-premium p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{ch.icon}</span>
                    <h4 className="font-display font-semibold text-foreground text-sm">{ch.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{ch.desc}</p>
                  <div className="text-xs space-y-1">
                    <p className="text-muted-foreground">{ch.societies} societies participating</p>
                    <p className="text-primary font-medium">Prize: {ch.prize}</p>
                    <p className="text-muted-foreground">Entry: {ch.entry} min</p>
                  </div>
                  <button className="w-full btn-primary-gradient text-white py-2 rounded-full text-xs font-medium">Join →</button>
                </div>
              ))}
            </div>
          </div>

          {/* Past Winners */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-3">Past Winners</h3>
            <div className="card-premium overflow-hidden">
              <div className="grid grid-cols-4 gap-3 px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                <span>Month</span><span>Winner</span><span>Points</span><span>Prize</span>
              </div>
              {pastWinners.map((w, i) => (
                <div key={i} className={`grid grid-cols-4 gap-3 px-4 py-3 text-sm border-b border-border/50 ${i === 0 ? 'bg-[#FFFBEB]' : 'hover:bg-secondary/30'} transition-colors`}>
                  <span className="text-foreground">{w.month}</span>
                  <span className="font-medium text-foreground">{w.winner}</span>
                  <span className="font-mono text-foreground">{w.points}</span>
                  <span className="text-primary text-xs">{w.prize}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {mainTab === 'History' && (
        <div className="card-premium p-8 text-center">
          <Trophy className="w-10 h-10 text-primary/30 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-foreground mb-1">Challenge History</h3>
          <p className="text-sm text-muted-foreground">Your past challenge participations and results will appear here.</p>
        </div>
      )}
    </div>
  );
}