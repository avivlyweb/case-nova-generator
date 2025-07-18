import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBottomNav from "./mobile/MobileBottomNav";
import MobileHeader from "./mobile/MobileHeader";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "PhysioCase";
      case "/dashboard":
        return "Dashboard";
      case "/case-studies":
        return "Case Studies";
      case "/generate":
        return "Generate Case";
      case "/feedback":
        return "Feedback";
      case "/about":
        return "About";
      default:
        return "PhysioCase";
    }
  };

  return (
    <div className="flex min-h-screen bg-soft-gradient">
      {/* Mobile Header */}
      {isMobile && (
        <MobileHeader
          title={getPageTitle()}
          subtitle={location.pathname === "/" ? "AI-Powered Clinical Cases" : undefined}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showSearch={location.pathname === "/case-studies"}
          showNotifications={true}
        />
      )}

      {/* Sidebar with mobile overlay */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content with improved mobile spacing */}
      <main className={`flex-1 overflow-x-hidden ${isMobile ? "pt-20 pb-20" : ""}`}>
        <div className="min-h-screen bg-background/50 backdrop-blur-sm">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}

      {/* Enhanced overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;