import { useState } from "react";
import { CalendarDays, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

export default function RequestPickup() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'one-time' | 'subscribe'>('one-time');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeWindow, setTimeWindow] = useState('morning');
  const [wasteType, setWasteType] = useState('mixed');
  const [frequency, setFrequency] = useState('daily');
  const [whatsapp, setWhatsapp] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const collectionId = `PKP-2026-0301-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto stagger-fade-in">
        <div className="green-gradient grain-overlay rounded-2xl p-8 overflow-hidden relative">
          <div className="relative z-10 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-white mx-auto" />
            <h2 className="text-2xl font-display font-bold text-white">Pickup Scheduled!</h2>
            <div className="space-y-2 text-white/90 text-sm">
              <p>Collection ID: <span className="font-mono font-semibold">{collectionId}</span></p>
              {mode === 'one-time' && date && (
                <p>Date: {date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              )}
              {mode === 'subscribe' && <p>Frequency: {frequency.charAt(0).toUpperCase() + frequency.slice(1)}</p>}
              <p>Time: {timeWindow === 'morning' ? 'Morning 7–9 AM' : 'Afternoon 2–4 PM'}</p>
              <p>Waste Type: {wasteType.charAt(0).toUpperCase() + wasteType.slice(1)}</p>
            </div>
            <button
              onClick={() => navigate('/collection')}
              className="mt-4 px-6 py-3 rounded-full bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-colors inline-flex items-center gap-2"
            >
              Track Collection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 stagger-fade-in">
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Request Pickup</h1>
        <p className="text-sm text-muted-foreground">Schedule a waste collection at your doorstep</p>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-full bg-secondary p-0.5 text-sm w-fit">
        <button onClick={() => setMode('one-time')} className={`px-4 py-1.5 rounded-full transition-colors ${mode === 'one-time' ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground'}`}>One-time</button>
        <button onClick={() => setMode('subscribe')} className={`px-4 py-1.5 rounded-full transition-colors ${mode === 'subscribe' ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground'}`}>Subscribe</button>
      </div>

      {/* Form */}
      <div className="card-premium p-6 space-y-6">
        {/* Date or Frequency */}
        {mode === 'one-time' ? (
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Pickup Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full h-10 px-4 rounded-xl bg-surface border border-border text-sm text-left flex items-center gap-2 hover:border-border-highlight transition-colors">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  {date ? date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Select a date'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Frequency</label>
            <div className="flex gap-2">
              {['daily', 'weekly', 'monthly'].map(f => (
                <button key={f} onClick={() => setFrequency(f)} className={`px-4 py-2 rounded-full text-sm transition-colors ${frequency === f ? 'btn-primary-gradient text-white font-medium' : 'bg-surface border border-border text-foreground hover:border-border-highlight'}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Window */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Time Window</label>
          <div className="flex gap-2">
            <button onClick={() => setTimeWindow('morning')} className={`flex-1 px-4 py-2.5 rounded-full text-sm transition-colors ${timeWindow === 'morning' ? 'btn-primary-gradient text-white font-medium' : 'bg-surface border border-border text-foreground hover:border-border-highlight'}`}>
              Morning 7–9 AM
            </button>
            <button onClick={() => setTimeWindow('afternoon')} className={`flex-1 px-4 py-2.5 rounded-full text-sm transition-colors ${timeWindow === 'afternoon' ? 'btn-primary-gradient text-white font-medium' : 'bg-surface border border-border text-foreground hover:border-border-highlight'}`}>
              Afternoon 2–4 PM
            </button>
          </div>
        </div>

        {/* Waste Type */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Waste Type</label>
          <div className="flex gap-2">
            {[
              { key: 'wet', label: 'Wet', activeClass: 'bg-accent text-white' },
              { key: 'dry', label: 'Dry', activeClass: 'bg-warning text-white' },
              { key: 'mixed', label: 'Mixed', activeClass: 'btn-primary-gradient text-white' },
            ].map(w => (
              <button key={w.key} onClick={() => setWasteType(w.key)} className={`flex-1 px-4 py-2.5 rounded-full text-sm transition-colors font-medium ${wasteType === w.key ? w.activeClass : 'bg-surface border border-border text-foreground hover:border-border-highlight'}`}>
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* WhatsApp opt-in */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">WhatsApp Notifications</p>
            <p className="text-xs text-muted-foreground">Get real-time updates on your pickup</p>
          </div>
          <Switch checked={whatsapp} onCheckedChange={setWhatsapp} />
        </div>

        {/* Submit */}
        <button onClick={() => setSubmitted(true)} className="w-full btn-primary-gradient text-white py-3 rounded-full text-sm font-semibold">
          Schedule Pickup
        </button>
      </div>
    </div>
  );
}
