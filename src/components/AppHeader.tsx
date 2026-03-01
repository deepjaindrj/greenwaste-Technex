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

  return (
    <>
      <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 md:px-6 bg-card/85 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-full hover:bg-secondary transition-colors">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search WasteOS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-9 pl-9 pr-4 rounded-full bg-surface text-sm text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setNotifOpen(true)} className="relative p-2 rounded-full hover:bg-secondary transition-colors">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-glow flex items-center justify-center text-xs font-semibold text-primary">
            {initials}
          </div>
        </div>
      </header>
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}