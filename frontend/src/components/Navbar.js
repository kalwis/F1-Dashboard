import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaTrophy, FaChartLine, FaBalanceScale } from "react-icons/fa";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { path: "/rankings", label: "Rankings", icon: FaTrophy },
    { path: "/predictions", label: "Predictions", icon: FaChartLine },
    { path: "/compare", label: "Compare", icon: FaBalanceScale },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex justify-center w-full p-4">
      <nav className="bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 shadow-xl">
        <div className="flex items-center space-x-8">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">F1</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-wide">
              F1 Dashboard
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
} 