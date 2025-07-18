import { Link, useLocation } from "react-router-dom";
import { Home, FileText, PlusCircle, ChartBar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MobileBottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/dashboard", icon: ChartBar, label: "Dashboard" },
    { to: "/generate", icon: PlusCircle, label: "Generate", isMain: true },
    { to: "/case-studies", icon: FileText, label: "Cases" },
    { to: "/about", icon: User, label: "About" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, icon: Icon, label, isMain }) => {
            const isActive = location.pathname === to;
            
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px] relative",
                  isMain
                    ? "bg-medical-gradient text-white shadow-lg -mt-4 p-3"
                    : isActive
                    ? "text-primary bg-primary/10"
                    : "text-gray-500 hover:text-primary hover:bg-gray-50"
                )}
              >
                {isActive && !isMain && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <div className="relative z-10 flex flex-col items-center">
                  <Icon 
                    className={cn(
                      "w-5 h-5 mb-1",
                      isMain ? "w-6 h-6" : ""
                    )} 
                  />
                  <span 
                    className={cn(
                      "text-xs font-medium",
                      isMain ? "text-xs" : "text-[10px]"
                    )}
                  >
                    {label}
                  </span>
                </div>

                {isActive && (
                  <motion.div
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white/95 backdrop-blur-lg" />
    </div>
  );
};

export default MobileBottomNav;