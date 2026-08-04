import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Bell, User, LogOut } from "lucide-react";
import { COMPANY_LOGOS } from "../modules.js";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  function handleLogout() {
    localStorage.removeItem("userId");
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40">
      {/* Top Logo Slider */}
      <div className="bg-white py-2 overflow-hidden flex whitespace-nowrap border-b border-border shadow-sm">
        <motion.div 
          className="flex w-max items-center"
          animate={{ x: [0, -1000] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            },
          }}
        >
          {[...COMPANY_LOGOS, ...COMPANY_LOGOS, ...COMPANY_LOGOS, ...COMPANY_LOGOS, ...COMPANY_LOGOS].map((company, i) => (
            <div key={`${company.name}-${i}`} className="flex items-center justify-center px-6">
              <img 
                src={company.url} 
                alt={`${company.name} logo`} 
                className="max-w-[80px] h-4 object-contain opacity-90 hover:opacity-100 transition-opacity"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="hidden text-[11px] font-bold text-ink-soft">{company.name}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="backdrop-blur-md bg-paper/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-soft"
          >
            <Sparkles size={18} className="text-white" />
          </motion.div>
          <span className="font-display text-lg font-bold tracking-tight text-ink">AI interview</span>
        </Link>

        {!isHome && (
          <nav className="hidden md:flex items-center gap-1 bg-white border border-border rounded-full px-1.5 py-1.5 shadow-soft">
            {[
              ["Dashboard", "/dashboard"],
              ["Company Interviews", "/company-interviews"],
              ["Progress", "/progress"],
            ].map(([label, to]) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? "bg-primary-soft text-primary"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-ink-soft hover:text-primary hover:border-primary/30 transition-colors">
            <Bell size={16} />
          </button>
          {localStorage.getItem("userId") ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="w-9 h-9 rounded-full bg-primary-soft border border-border flex items-center justify-center text-primary hover:shadow-glow transition-shadow"
              >
                <User size={16} />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-ink-soft hover:text-primary hover:border-primary/30 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm px-3 py-1.5 rounded-full bg-white border border-border text-ink-soft hover:text-ink">
                Log in
              </Link>
              <Link to="/register" className="text-sm px-3 py-1.5 rounded-full bg-primary text-white hover:opacity-90">
                Register
              </Link>
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}
