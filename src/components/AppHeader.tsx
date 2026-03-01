import { Search, Bell, Menu } from "lucide-react";
import { useState } from "react";
import { NotificationDrawer } from "./NotificationDrawer";
import { useCitizen } from "@/hooks/use-citizen";

interface AppHeaderProps {
  onMenuClick?: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const { profile } = useCitizen();
  const initials = (profile?.full_name ?? 'AM').split(' ').map((n: string) => n[0]).join('').toUpperCase();
  const displayName = profile?.full_name ?? 'Deep Jain';

  return (
    <>
      {/* Header exactly matches sidebar logo section height (h-16) for full sync */}
      <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 bg-card/90 backdrop-blur-md border-b border-border shrink-0">
        {/* Left: mobile menu + search */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-colors shrink-0"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="relative hidden sm:flex items-center flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search WasteOS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-full bg-secondary/70 text-sm text-foreground placeholder:text-muted-foreground border border-border/60 outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/30 transition-all"
            />
          </div>
        </div>

        {/* Right: notifications + avatar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotifOpen(true)}
            className="relative p-2 rounded-xl hover:bg-secondary transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5 text-muted-foreground" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-destructive rounded-full" />
          </button>

          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 rounded-full bg-primary-glow border-2 border-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
              {initials}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-foreground leading-tight">{displayName}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Eco Champion</p>
            </div>
          </div>
        </div>
      </header>
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}