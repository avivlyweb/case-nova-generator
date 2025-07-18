import { Link, useLocation } from "react-router-dom";
import { Home, FileText, PlusCircle, MessageSquare, Info, ChartBar, Activity, Stethoscope } from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  
  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/dashboard", icon: ChartBar, label: "Dashboard" },
    { to: "/case-studies", icon: FileText, label: "My Case Studies" },
    { to: "/generate", icon: PlusCircle, label: "Generate New" },
    { to: "/feedback", icon: MessageSquare, label: "Feedback" },
    { to: "/about", icon: Info, label: "About" },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="w-64 bg-medical-gradient text-white h-full min-h-screen p-6 overflow-y-auto shadow-xl">
      {/* Enhanced Logo/Branding */}
      <div className="mb-10">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PhysioCase</h1>
            <div className="flex items-center space-x-1 text-xs text-white/80">
              <Activity className="w-3 h-3" />
              <span>AI-Powered Clinical Cases</span>
            </div>
          </div>
        </div>
      </div>
      
      <nav className="space-y-3">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            onClick={handleLinkClick}
            className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              location.pathname === to
                ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                : "text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1"
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform duration-200 ${
              location.pathname === to ? "scale-110" : "group-hover:scale-105"
            }`} />
            <span className="font-medium">{label}</span>
            {location.pathname === to && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
          </Link>
        ))}
      </nav>

      {/* Quick Stats or User Info */}
      <div className="mt-auto pt-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="text-xs text-white/60 mb-1">Quick Access</div>
          <Link 
            to="/generate" 
            onClick={handleLinkClick}
            className="flex items-center space-x-2 text-sm text-white hover:text-white/80 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Case Study</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;