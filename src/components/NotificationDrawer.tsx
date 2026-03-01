import { X, Check, AlertTriangle, Trophy, Recycle, AlertCircle } from "lucide-react";

const notifications = [
  { type: 'success', icon: Check, title: 'Waste scan complete', desc: '240 pts earned for proper segregation', time: '2 min ago', unread: true },
  { type: 'warning', icon: AlertTriangle, title: 'Zone 4-B overflow predicted', desc: 'Predicted overflow this Saturday in Andheri West', time: '1 hr ago', unread: true },
  { type: 'gold', icon: Trophy, title: "You've reached Eco Champion tier!", desc: 'Congratulations! You earned the Green Champion badge', time: '3 hrs ago', unread: true },
  { type: 'emerald', icon: Recycle, title: 'Weekly recycling report ready', desc: 'Your February week 4 report is available', time: 'Yesterday', unread: false },
  { type: 'danger', icon: AlertCircle, title: 'Hazardous waste detected in Ward 7', desc: 'Battery waste found — requires special disposal', time: 'Yesterday', unread: false },
];

const typeColors: Record<string, string> = {
  success: 'bg-primary-glow text-primary',
  warning: 'bg-warning/10 text-warning',
  gold: 'bg-[#FEF3C7] text-[#D97706]',
  emerald: 'bg-primary-glow text-accent',
  danger: 'bg-destructive/10 text-destructive',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-[70] w-[380px] max-w-full bg-card border-l border-border shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground">Notifications</h2>
          <div className="flex items-center gap-3">
            <button className="text-xs text-primary font-medium hover:underline">Mark all read</button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {notifications.map((n, i) => {
            const Icon = n.icon;
            return (
              <div key={i} className="flex items-start gap-3 px-5 py-4 border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${typeColors[n.type]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.desc}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                </div>
                {n.unread && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border text-center">
          <button className="text-sm text-primary font-medium hover:underline">View all notifications →</button>
        </div>
      </div>
    </>
  );
}