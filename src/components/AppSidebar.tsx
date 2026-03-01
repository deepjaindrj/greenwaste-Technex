import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Camera, Leaf, TrendingUp, Building2, Truck,
  Trophy, FileText, MapPin, Settings, PackageCheck, ShoppingBag, Wallet, Briefcase
} from "lucide-react";
import { useCitizen } from "@/hooks/use-citizen";

const citizenNav = [
  {
    label: "MAIN",
    items: [
      { title: "My Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { title: "Waste Scanner", icon: Camera, path: "/scan" },
      { title: "Request Pickup", icon: PackageCheck, path: "/request-pickup" },
    ],
  },
  {
    label: "COLLECTION",
    items: [
      { title: "Collection Tracker", icon: TrendingUp, path: "/collection" },
      { title: "Carbon Wallet", icon: Wallet, path: "/carbon" },
    ],
  },
  {
    label: "COMMUNITY",
    items: [
      { title: "Marketplace", icon: ShoppingBag, path: "/marketplace" },
      { title: "Carbon Earners", icon: Trophy, path: "/leaderboard" },
    ],
  },
];

const municipalNav = [
  {
    label: "OPERATIONS",
    items: [
      { title: "Operations Center", icon: Building2, path: "/municipal" },
      { title: "Truck Driver", icon: Truck, path: "/truck-driver" },
      { title: "ESG & Carbon Market", icon: Briefcase, path: "/esg" },
    ],
  },
  {
    label: "INSIGHTS",
    items: [
      { title: "Analytics", icon: TrendingUp, path: "/analytics" },
      { title: "Reports", icon: FileText, path: "/reports" },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { profile, portal: ctxPortal, setPortal: ctxSetPortal } = useCitizen();
  const [portal, setPortalLocal] = useState<'citizen' | 'municipal'>(
    () => ctxPortal ?? (localStorage.getItem('wasteos-portal') as 'citizen' | 'municipal') ?? 'citizen'
  );

  const handlePortalChange = (p: 'citizen' | 'municipal') => {
    setPortalLocal(p);
    ctxSetPortal(p);
    localStorage.setItem('wasteos-portal', p);
  };

  const displayName = profile?.full_name ?? 'Deep Jain';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  const city = profile?.city ?? 'Indore';

  const navSections = portal === 'citizen' ? citizenNav : municipalNav;

  return (
    <aside className="flex flex-col w-60 h-screen bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo — h-16 to match AppHeader height exactly */}
      <div className="h-16 px-5 flex items-center border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#22C55E] via-[#16A34A] to-[#0F9B3E] flex items-center justify-center shadow-sm">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-base text-foreground leading-tight">WasteOS</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">Waste Intelligence Platform</p>
          </div>
        </div>
      </div>

      {/* Portal Toggle */}
      <div className="px-3 pt-4 pb-2">
        <div className="flex rounded-full bg-secondary p-0.5 text-xs">
          <button
            onClick={() => handlePortalChange('citizen')}
            className={`flex-1 px-3 py-1.5 rounded-full transition-colors text-center ${portal === 'citizen' ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground'}`}
          >
            Citizen
          </button>
          <button
            onClick={() => handlePortalChange('municipal')}
            className={`flex-1 px-3 py-1.5 rounded-full transition-colors text-center ${portal === 'municipal' ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground'}`}
          >
            Municipal Corp
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                      isActive
                        ? "bg-primary-glow text-primary font-medium border-l-2 border-primary"
                        : "text-sidebar-foreground hover:bg-secondary"
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-sidebar-border space-y-3">
        <div className="card-premium p-3 rounded-xl">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium text-foreground">{city}, Madhya Pradesh</span>
          </div>
          <p className="mt-1 text-[10px] text-primary font-medium">Sustainability Score: 74</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-glow flex items-center justify-center text-xs font-semibold text-primary">{initials}</div>
            <div>
              <p className="text-xs font-medium text-foreground">{displayName}</p>
              <p className="text-[10px] text-muted-foreground">Eco Champion</p>
            </div>
          </div>
          <NavLink to="/settings" className={`p-2 rounded-xl transition-colors ${location.pathname === '/settings' ? 'bg-primary-glow text-primary' : 'text-muted-foreground hover:bg-secondary'}`}>
            <Settings className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
