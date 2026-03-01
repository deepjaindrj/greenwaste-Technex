import { useState } from "react";
import { User, Bell, MapPin, Shield, Palette, Save, Loader2 } from "lucide-react";
import LeafletMap from "@/components/LeafletMap";
import { useCitizen } from "@/hooks/use-citizen";
import { useSupabaseMutation } from "@/hooks/use-supabase-query";
import { updateProfile } from "@/lib/api";

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'location', label: 'City & Location', icon: MapPin },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const notifSettings = [
  { label: 'Weekly Impact Summary', desc: 'Receive a digest of your weekly waste and carbon stats', default: true },
  { label: 'New Challenge Alerts', desc: 'Get notified when new eco challenges are available', default: true },
  { label: 'Reward Redemption Confirmations', desc: 'Confirm when you redeem Green Points', default: true },
  { label: 'Municipal Alerts for Your Zone', desc: 'Overflow alerts, truck delays in your area', default: false },
  { label: 'AI Insights Digest', desc: 'Weekly AI-generated sustainability recommendations', default: true },
];

export default function Settings() {
  const { citizenId } = useCitizen();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifs, setNotifs] = useState(notifSettings.map(n => n.default));

  const displayName = 'Guest User';
  const initials = 'GU';
  const city = 'Indore';

  const [name, setName] = useState(displayName);
  const [email, setEmail] = useState('arjun@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [saving, setSaving] = useState(false);

  const saveMutation = useSupabaseMutation(
    async (data: { full_name: string; city: string }) => updateProfile(citizenId!, data),
    [['profile']],
  );

  const handleSaveProfile = async () => {
    if (!citizenId) return;
    setSaving(true);
    try {
      await saveMutation.mutateAsync({ full_name: name, city });
    } catch { /* fallback */ }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 stagger-fade-in">
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        {/* Tabs */}
        <div className="space-y-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-150 ${activeTab === t.id ? 'bg-primary-glow text-primary font-medium' : 'text-muted-foreground hover:bg-secondary'}`}
            >
              <t.icon className="w-4 h-4 shrink-0" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card-premium p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="font-display font-semibold text-foreground">Profile Settings</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-glow flex items-center justify-center text-xl font-display font-bold text-primary">{initials}</div>
                <button className="btn-secondary px-4 py-2 rounded-full text-sm">Change Photo</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: name, type: 'text', onChange: (v: string) => setName(v) },
                  { label: 'Email', value: email, type: 'email', onChange: (v: string) => setEmail(v) },
                  { label: 'Phone', value: phone, type: 'tel', onChange: (v: string) => setPhone(v) },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs text-muted-foreground block mb-1.5">{f.label}</label>
                    <input type={f.type} value={f.value} onChange={e => f.onChange(e.target.value)} className="w-full h-10 px-4 rounded-xl border border-border bg-card text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">City</label>
                  <select className="w-full h-10 px-4 rounded-xl border border-border bg-card text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                    <option>Indore</option><option>Bhopal</option><option>Ujjain</option><option>Jabalpur</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground block mb-1.5">Society / Building Name</label>
                  <input type="text" defaultValue="Harmony Heights" className="w-full h-10 px-4 rounded-xl border border-border bg-card text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow" />
                </div>
              </div>
              <button disabled={saving} onClick={handleSaveProfile} className="btn-primary-gradient text-white px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Saving…' : 'Save Changes'}
              </button>

              {/* Eco Tier */}
              <div className="card-premium p-4 bg-gradient-to-br from-card to-primary-glow/20">
                <p className="text-xs text-muted-foreground">Current Eco Tier</p>
                <p className="text-lg font-display font-semibold text-primary mt-0.5">Green Champion 🌿</p>
                <div className="w-full h-1 bg-surface rounded-full overflow-hidden mt-3">
                  <div className="h-full progress-bar-gradient" style={{ width: '72%' }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">2,550 pts to Platinum</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="font-display font-semibold text-foreground">Notification Preferences</h3>
              <div className="space-y-4">
                {notifSettings.map((n, i) => (
                  <div key={n.label} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{n.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifs(prev => prev.map((v, j) => j === i ? !v : v))}
                      className={`w-11 h-6 rounded-full transition-colors relative ${notifs[i] ? 'bg-primary' : 'bg-border'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notifs[i] ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <button className="btn-primary-gradient text-white px-6 py-2.5 rounded-full text-sm font-medium">Save Preferences</button>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-6">
              <h3 className="font-display font-semibold text-foreground">City & Location</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">City</label>
                  <select className="w-full h-10 px-4 rounded-xl border border-border bg-card text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                    <option>Indore</option><option>Bhopal</option><option>Ujjain</option><option>Jabalpur</option><option>Gwalior</option><option>Rewa</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Zone / Ward</label>
                  <select className="w-full h-10 px-4 rounded-xl border border-border bg-card text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                    <option>Zone 4 — Vijay Nagar</option><option>Zone 1 — Sapna Sangeeta</option><option>Zone 3 — Rajwada</option>
                  </select>
                </div>
              </div>
              <button className="btn-secondary px-5 py-2 rounded-full text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Auto-detect Location
              </button>
              <div className="rounded-2xl overflow-hidden h-48">
                <LeafletMap center={[22.7196, 75.8577]} zoom={13} />
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">Privacy Settings</h3>
              <p className="text-sm text-muted-foreground">Control your data visibility and sharing preferences.</p>
              {[
                { label: 'Show on public leaderboard', on: true },
                { label: 'Share waste scan data for city analytics', on: true },
                { label: 'Allow society members to see your stats', on: false },
              ].map(p => (
                <div key={p.label} className="flex items-center justify-between py-3 border-b border-border/50">
                  <span className="text-sm text-foreground">{p.label}</span>
                  <div className={`w-11 h-6 rounded-full ${p.on ? 'bg-primary' : 'bg-border'} relative`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm ${p.on ? 'left-[22px]' : 'left-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="font-display font-semibold text-foreground">Appearance</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Language</label>
                  <select className="w-full h-10 px-4 rounded-xl border border-border bg-card text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                    <option>English</option><option>Hindi</option><option>Marathi</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Units</label>
                  <div className="flex rounded-full bg-secondary p-0.5 text-sm w-fit">
                    <button className="px-4 py-1.5 rounded-full bg-card text-foreground font-medium shadow-sm">Metric</button>
                    <button className="px-4 py-1.5 rounded-full text-muted-foreground">Imperial</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Dashboard Density</label>
                  <div className="flex rounded-full bg-secondary p-0.5 text-sm w-fit">
                    <button className="px-4 py-1.5 rounded-full bg-card text-foreground font-medium shadow-sm">Comfortable</button>
                    <button className="px-4 py-1.5 rounded-full text-muted-foreground">Compact</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}