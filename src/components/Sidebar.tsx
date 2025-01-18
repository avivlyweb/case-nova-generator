import { Link, useLocation } from "react-router-dom";
import { Home, FileText, PlusCircle, MessageSquare, Info, ChartBar, Mic } from "lucide-react";

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
    { to: "/podcast", icon: Mic, label: "Podcast Studio" },
    { to: "/feedback", icon: MessageSquare, label: "Feedback" },
    { to: "/about", icon: Info, label: "About" },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="w-64 bg-primary text-white h-full min-h-screen p-4 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">PhysioCase</h1>
        <p className="text-sm text-gray-300">Case Study Generator</p>
      </div>
      
      <nav className="space-y-2">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            onClick={handleLinkClick}
            className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === to
                ? "bg-white/10 text-white"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;