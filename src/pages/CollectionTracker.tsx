import { useState } from "react";
import { Phone, ArrowRight, Truck } from "lucide-react";
import LeafletMap from "@/components/LeafletMap";
import { useNavigate } from "react-router-dom";
import { pickupRequests, collectionHistory } from "@/lib/mockData";

const steps = ['Requested', 'Assigned', 'En Route', 'Collecting', 'Processed'];

export default function CollectionTracker() {
  const navigate = useNavigate();
  const [viewCompleted, setViewCompleted] = useState(false);

  const activeRequest = viewCompleted ? pickupRequests[1] : pickupRequests[0];
  const activeStatusIndex = steps.indexOf(activeRequest.status === 'Complete' ? 'Processed' : activeRequest.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6 stagger-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Collection Tracker</h1>
          <p className="text-sm text-muted-foreground">Track your waste pickup in real time</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-primary-glow text-primary text-xs font-mono font-medium">
          {activeRequest.id}
        </span>
      </div>

      {/* View toggle */}
      <div className="flex rounded-full bg-secondary p-0.5 text-sm w-fit">
        <button onClick={() => setViewCompleted(false)} className={`px-4 py-1.5 rounded-full transition-colors ${!viewCompleted ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground'}`}>Active</button>
        <button onClick={() => setViewCompleted(true)} className={`px-4 py-1.5 rounded-full transition-colors ${viewCompleted ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground'}`}>Completed</button>
      </div>

      {/* Vertical Stepper */}
      <div className="card-premium p-6">
        <div className="space-y-0">
          {steps.map((step, i) => {
            const isDone = i < activeStatusIndex;
            const isActive = i === activeStatusIndex;
            const isFuture = i > activeStatusIndex;

            return (
              <div key={step} className="flex gap-4">
                {/* Line + Circle */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isDone ? 'bg-primary text-white' :
                    isActive ? 'bg-primary text-white pulse-glow' :
                    'bg-surface border-2 border-border text-muted-foreground'
                  }`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 h-12 ${isDone ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </div>

                {/* Content */}
                <div className="pb-6 pt-1">
                  <p className={`text-sm font-medium ${isActive ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step}
                  </p>
                  {isActive && step === 'En Route' && (
                    <div className="mt-2 p-3 rounded-xl bg-primary-glow/50 border border-primary/10 space-y-1">
                      <p className="text-xs text-foreground"><span className="font-medium">Collector:</span> {activeRequest.collector}</p>
                      <p className="text-xs text-foreground"><span className="font-medium">Truck:</span> {activeRequest.truckId}</p>
                      <p className="text-xs text-primary font-medium">ETA: {activeRequest.eta}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collector Info */}
      {activeRequest.collector && (
        <div className="card-premium p-5">
          <h3 className="font-display font-semibold text-foreground mb-3">Collector</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-glow flex items-center justify-center text-sm font-semibold text-primary">
              {activeRequest.collector.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{activeRequest.collector}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Phone className="w-3 h-3" /> {activeRequest.phone}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Truck className="w-4 h-4" /> {activeRequest.truckId}
            </div>
          </div>

          {/* Map */}
          <div className="w-full h-40 rounded-2xl overflow-hidden mt-4">
            <LeafletMap
              center={[22.7533, 75.8937]}
              zoom={14}
              markers={[
                { lat: 22.7533, lng: 75.8937, label: 'Pickup — Vijay Nagar' },
              ]}
            />
          </div>
        </div>
      )}

      {/* Scan Results (when complete) */}
      {(activeRequest.status === 'Complete' || viewCompleted) && (
        <div className="space-y-4">
          <div className="card-premium p-5">
            <h3 className="font-display font-semibold text-foreground mb-3">Scan Results</h3>
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">Wet {collectionHistory[0].wetKg}kg</span>
              <span className="px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">Dry {collectionHistory[0].dryKg}kg</span>
              <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">Hazardous {collectionHistory[0].hazardousKg}kg</span>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Segregation Score</span>
                <span className="font-medium text-foreground">{collectionHistory[0].segregationScore}%</span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full progress-bar-gradient" style={{ width: `${collectionHistory[0].segregationScore}%` }} />
              </div>
            </div>
          </div>

          <div className="green-gradient grain-overlay rounded-2xl p-6 overflow-hidden relative text-center">
            <div className="relative z-10">
              <p className="text-2xl font-display font-bold text-white">+{collectionHistory[0].creditsEarned} Carbon Credits Earned!</p>
              <button onClick={() => navigate('/carbon')} className="mt-3 px-5 py-2 rounded-full bg-white text-primary text-sm font-medium hover:bg-white/90 transition-colors inline-flex items-center gap-2">
                View in Carbon Wallet <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Past Collections */}
      <div className="card-premium p-5">
        <h3 className="font-display font-semibold text-foreground mb-3">Past Collections</h3>
        <div className="space-y-3">
          {collectionHistory.slice(1, 3).map(c => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{c.date}</p>
                <p className="text-xs text-muted-foreground">{c.totalKg} kg total</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.segregationScore >= 80 ? 'bg-primary-glow text-primary' : 'bg-warning/10 text-warning'}`}>
                  {c.segregationScore}%
                </span>
                <span className="text-xs font-medium text-primary">+{c.creditsEarned}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
