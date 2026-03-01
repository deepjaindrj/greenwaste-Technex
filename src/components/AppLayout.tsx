import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useState } from "react";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      
      {/* Sidebar - fixed, never scrolls with page */}
      <div className={`fixed top-0 left-0 h-screen z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <AppSidebar />
      </div>

      {/* Main content area - offset by sidebar width, this is the only scrollable area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60 h-screen">
        <AppHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}