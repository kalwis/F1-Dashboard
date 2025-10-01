import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", emoji: "📊" },
    { path: "/rankings", label: "Rankings", emoji: "🏆" },
    { path: "/predictions", label: "Predictions", emoji: "🎯" },
    { path: "/compare", label: "Compare", emoji: "⚖️" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full p-4 bg-gradient-to-b from-black/80 to-transparent">
      <nav className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 shadow-2xl relative overflow-hidden">
        {/* Racing stripe background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        
        <div className="flex items-center space-x-8 relative z-10">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className="text-white font-bold text-lg tracking-wide group-hover:text-red-400 transition-colors">
              F1 Dashboard
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative group"
                >
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-red-600/30 to-orange-600/30 text-white shadow-lg backdrop-blur-sm"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}>
                    <span className={`text-base transition-transform group-hover:scale-110 ${active ? 'animate-pulse' : ''}`}>
                      {item.emoji}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  
                  {/* Racing stripe under active tab */}
                  {active && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>
                  )}
                  
                  {/* Checkered flag on hover */}
                  {!active && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
} 