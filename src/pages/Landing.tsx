import { ArrowRight, Leaf, Camera, Star, Play, MapPin, Brain, Trophy, Zap, Quote, Home, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCitizen } from "@/hooks/use-citizen";

const stats = [
  { value: '2,847 kg', label: 'Waste Tracked Today' },
  { value: '1,245 kg', label: 'CO₂ Saved' },
  { value: '78.4%', label: 'Avg Segregation Rate' },
  { value: '8,420', label: 'Green Points Awarded' },
  { value: '312', label: 'Active Trucks' },
];

const steps = [
  { num: '01', icon: Camera, title: 'Scan Your Waste', desc: 'Upload or photograph waste. Our YOLO AI instantly detects and classifies every item.' },
  { num: '02', icon: Leaf, title: 'See Your Impact', desc: 'Get real-time carbon calculations, segregation scores, and actionable disposal guidance.' },
  { num: '03', icon: Star, title: 'Earn & Improve', desc: 'Collect Green Points, unlock rewards, and watch your city\'s sustainability score climb.' },
];

const testimonials = [
  { quote: 'WasteOS transformed how our society handles waste. We went from 40% to 82% segregation in just 3 months.', name: 'Priya Sharma', role: 'Society President', city: 'Indore' },
  { quote: 'The predictive AI helped us reduce overflow incidents by 60%. Our citizens love the rewards system.', name: 'Rajesh Gupta', role: 'Municipal Commissioner', city: 'Bhopal' },
  { quote: 'Finally, a platform that makes sustainability measurable and fun. Our ESG scores improved significantly.', name: 'Anita Deshmukh', role: 'CSR Head, TechCorp', city: 'Ujjain' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { setPortal, loading } = useCitizen();

  const handlePortal = (portal: 'citizen' | 'municipal') => {
    setPortal(portal);
    navigate(portal === 'citizen' ? '/dashboard' : '/municipal');
  };

  return (
    <div className="min-h-screen" style={{ background: '#F7FDF9' }}>
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#22C55E] via-[#16A34A] to-[#0F9B3E] flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-lg text-foreground">WasteOS</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => handlePortal('citizen')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</button>
            <button disabled={loading} onClick={() => handlePortal('citizen')} className="btn-primary-gradient text-white px-5 py-2 rounded-full text-sm font-medium disabled:opacity-60">
              {loading ? 'Loading…' : 'Get Started'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#22C55E] rounded-full opacity-[0.06] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#10B981] rounded-full opacity-[0.04] blur-[100px]" />
        <div className="absolute top-20 left-10 w-40 h-40 bg-[#14B8A6] rounded-full opacity-[0.04] blur-[80px]" />

        <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-glow border border-[#BBF7D0] text-primary text-sm font-medium mb-8">
            🌍 Trusted by 50+ Indian Cities
          </div>

          {/* Headline */}
          <h1 className="font-display font-black text-5xl md:text-7xl text-foreground leading-[1.05] mb-6">
            India's Waste.<br />
            Finally{' '}
            <span className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] bg-clip-text text-transparent">
              Intelligent.
            </span>
          </h1>

          {/* Sub */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 font-body leading-relaxed">
            WasteOS tracks waste, carbon impact and recycling behaviour in real time — rewarding citizens and helping cities become truly sustainable.
          </p>

          {/* Portal Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
            <div className="card-premium p-8 text-left hover:-translate-y-1 transition-all duration-200 cursor-pointer" onClick={() => handlePortal('citizen')}>
              <div className="w-12 h-12 rounded-2xl bg-primary-glow flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-xl text-foreground mb-2">I'm a Citizen</h3>
              <p className="text-sm text-muted-foreground mb-5">Request pickups, earn carbon credits, sell to brands</p>
              <button disabled={loading} onClick={() => handlePortal('citizen')} className="btn-primary-gradient text-white px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 w-full justify-center disabled:opacity-60">
                {loading ? 'Loading...' : 'Enter Citizen Portal'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="card-premium p-8 text-left hover:-translate-y-1 transition-all duration-200 cursor-pointer" onClick={() => handlePortal('municipal')}>
              <div className="w-12 h-12 rounded-2xl bg-primary-glow flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-xl text-foreground mb-2">I'm a Municipal Corp</h3>
              <p className="text-sm text-muted-foreground mb-5">Manage city waste, approve ESG buyers, track analytics</p>
              <button disabled={loading} onClick={() => handlePortal('municipal')} className="btn-secondary px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 w-full justify-center disabled:opacity-60">
                {loading ? 'Loading...' : 'Enter Municipal Portal'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Social proof */}
          <p className="text-sm text-muted-foreground">
            Join <span className="font-semibold text-foreground">1.2M+</span> citizens · <span className="font-semibold text-foreground">50</span> cities · <span className="font-semibold text-foreground">847 tonnes</span> CO₂ saved
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-0">
              {i > 0 && <div className="w-px h-10 bg-border mr-8" />}
              <div className={i > 0 ? 'ml-0' : ''}>
                <p className="text-2xl md:text-3xl font-display font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">How WasteOS Works</h2>
            <p className="text-muted-foreground mt-3">Three simple steps to a smarter, greener city</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="card-premium p-8 h-full">
                  <span className="text-5xl font-display font-black text-primary/10">{step.num}</span>
                  <div className="w-12 h-12 rounded-2xl bg-primary-glow flex items-center justify-center mt-2 mb-4">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 text-2xl text-border">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">Everything a Smart City Needs</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4 auto-rows-[200px]">
            {/* Large */}
            <div className="card-premium p-6 md:col-span-2 md:row-span-2 flex flex-col justify-between overflow-hidden">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary-glow flex items-center justify-center mb-3">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">AI Waste Scanner</h3>
                <p className="text-sm text-muted-foreground mt-1">YOLO-powered detection classifies any waste in under 2 seconds with 94% accuracy.</p>
              </div>
              <div className="mt-4 rounded-2xl bg-foreground/5 h-40 flex items-center justify-center text-muted-foreground text-sm">
                <Camera className="w-8 h-8 opacity-30" />
              </div>
            </div>
            {/* Medium */}
            <div className="card-premium p-6 md:col-span-2 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-glow flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">Carbon Footprint Tracker</h3>
              </div>
              <p className="text-4xl font-display font-bold text-primary mt-2">2.4t <span className="text-base font-normal text-muted-foreground">CO₂ saved</span></p>
            </div>
            {/* Medium */}
            <div className="card-premium p-6 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary-glow flex items-center justify-center mb-2">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-sm text-foreground">Municipal Command</h3>
              <div className="mt-2 rounded-xl bg-foreground/5 h-16 flex items-center justify-center">
                <MapPin className="w-5 h-5 opacity-20" />
              </div>
            </div>
            {/* Small */}
            <div className="card-premium p-6 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary-glow flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-sm text-foreground">Reward System</h3>
              <p className="text-xs text-muted-foreground mt-1">Earn Green Points for every eco-action</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">What People Are Saying</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card-premium p-6">
                <Quote className="w-8 h-8 text-primary/20 mb-3" />
                <p className="text-sm text-foreground italic leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto green-gradient grain-overlay rounded-3xl py-16 px-12 text-center overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">Ready to transform your city's waste management?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">Join thousands of citizens and municipalities building a sustainable future with AI.</p>
            <div className="flex items-center justify-center gap-4">
              <button disabled={loading} onClick={() => handlePortal('citizen')} className="px-8 py-3.5 rounded-full bg-white text-primary font-semibold text-base hover:bg-white/90 transition-colors disabled:opacity-60">
                {loading ? 'Loading…' : 'Get Started Free'}
              </button>
              <button className="px-8 py-3.5 rounded-full border border-white/30 text-white font-medium text-base hover:bg-white/10 transition-colors">
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#22C55E] to-[#0F9B3E] flex items-center justify-center">
              <Leaf className="w-3 h-3 text-white" />
            </div>
            <span className="font-display font-semibold text-foreground">WasteOS</span>
            <span className="text-xs text-muted-foreground ml-2">Waste Intelligence Platform</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <button onClick={() => handlePortal('citizen')}>Dashboard</button>
            <button onClick={() => { handlePortal('citizen'); navigate('/scan'); }}>Scanner</button>
            <button onClick={() => { handlePortal('citizen'); navigate('/carbon'); }}>Carbon</button>
            <button onClick={() => { handlePortal('citizen'); navigate('/marketplace'); }}>Rewards</button>
          </div>
          <p className="text-xs text-muted-foreground">© 2024 WasteOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}