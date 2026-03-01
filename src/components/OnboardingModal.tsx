import { useState, useEffect } from "react";
import { Camera, Leaf, Trophy, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

const ONBOARDING_KEY = 'wasteos_onboarded';

const steps = [
  {
    icon: '🗑️',
    title: 'Welcome to WasteOS',
    subtitle: "India's first AI-powered waste intelligence platform",
    body: "In just a few seconds, we'll show you how to track waste, earn rewards, and help your city go green.",
  },
  {
    iconComponent: Camera,
    title: 'Scan Any Waste Instantly',
    body: 'Point your camera at any waste item. Our YOLO AI identifies, classifies, and calculates the carbon impact in under 2 seconds.',
    hasScanner: true,
  },
  {
    iconComponent: Leaf,
    title: 'Track Your Carbon Impact',
    body: 'Every action is tracked. See exactly how much CO₂ you\'ve saved, trees protected, and landfill avoided — all in real time.',
    chips: ['🌳 47 trees saved', '♻️ 320kg landfill avoided', '⚡ 840 kWh saved'],
  },
  {
    iconComponent: Trophy,
    title: 'Earn Rewards for Going Green',
    body: 'Collect Green Points for every correct segregation. Redeem them for real discounts, eco-products, and city leaderboard glory.',
    isLast: true,
  },
];

export function OnboardingModal() {
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    setShow(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  if (!show) return null;

  const step = steps[current];
  const Icon = step.iconComponent;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-3xl max-w-lg w-full mx-4 p-10 shadow-2xl relative overflow-hidden">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {step.icon ? (
            <div className="w-20 h-20 rounded-full bg-primary-glow flex items-center justify-center text-4xl">
              {step.icon}
            </div>
          ) : Icon ? (
            <div className="w-20 h-20 rounded-full bg-primary-glow flex items-center justify-center pulse-glow">
              <Icon className="w-8 h-8 text-primary" />
            </div>
          ) : null}
        </div>

        {/* Title */}
        <h2 className="font-display font-bold text-2xl text-foreground text-center mb-2">{step.title}</h2>
        {'subtitle' in step && step.subtitle && (
          <p className="text-sm text-primary font-medium text-center mb-3">{step.subtitle}</p>
        )}
        <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">{step.body}</p>

        {/* Scanner animation */}
        {step.hasScanner && (
          <div className="relative w-full h-32 rounded-2xl bg-foreground/5 mb-6 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="w-8 h-8 text-primary/20" />
            </div>
            <div className="absolute left-0 right-0 h-0.5 bg-primary/60 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-[scanLineOnboard_2s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Chips */}
        {step.chips && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {step.chips.map(c => (
              <span key={c} className="px-3 py-1.5 rounded-full bg-primary-glow text-primary text-xs font-medium">{c}</span>
            ))}
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <div>
            {current > 0 && (
              <button onClick={() => setCurrent(c => c - 1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>
          <button
            onClick={() => step.isLast ? close() : setCurrent(c => c + 1)}
            className="btn-primary-gradient text-white px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"
          >
            {step.isLast ? 'Enter Dashboard' : current === 0 ? 'Get Started' : 'Next'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Skip */}
        <button onClick={close} className="absolute top-4 right-4 text-xs text-muted-foreground hover:text-foreground transition-colors">Skip tour</button>
      </div>

      <style>{`
        @keyframes scanLineOnboard {
          0% { top: 8%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 88%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}