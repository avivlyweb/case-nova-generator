import { Button } from "@/components/ui/button";
import { Menu, Bell, Search, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
}

const MobileHeader = ({ 
  title, 
  subtitle, 
  onMenuClick, 
  showSearch = false, 
  showNotifications = false 
}: MobileHeaderProps) => {
  const [showSearchBar, setShowSearchBar] = useState(false);

  return (
    <div className="md:hidden">
      {/* Main Header */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="h-10 w-10 rounded-full hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-primary truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {showSearch && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearchBar(!showSearchBar)}
                className="h-10 w-10 rounded-full hover:bg-gray-100"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
            
            {showNotifications && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-gray-100 relative"
              >
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-gray-100"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {showSearchBar && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-200 px-4 py-3"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search case studies..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MobileHeader;