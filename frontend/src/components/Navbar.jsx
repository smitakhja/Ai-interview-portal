import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bell, User, LogOut, Menu, X, Shield, Sun, Moon } from "lucide-react";
import { COMPANY_LOGOS } from "../modules.js";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const isAdminPage = location.pathname.startsWith("/admin");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  }

  async function handleLogout() {
    try {
      const { auth, firebaseConfigured } = await import("../firebase.js");
      if (firebaseConfigured) {
        const { signOut } = await import("firebase/auth");
        await signOut(auth);
      }
    } catch (err) {
      console.warn("Firebase logout failed:", err);
    }
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    navigate("/login");
  }

  const navLinks = [
    ["Dashboard", "/dashboard"],
    ["Company Interviews", "/company-interviews"],
    ["Progress", "/progress"],
  ];

  return (
    <header className="sticky top-0 z-40">
      {/* Top Logo Slider */}
      <div className="bg-surface py-1.5 sm:py-2 overflow-hidden flex whitespace-nowrap border-b border-border shadow-sm">
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
            <div key={`${company.name}-${i}`} className="flex items-center justify-center px-4 sm:px-6">
              <img 
                src={company.url} 
                alt={`${company.name} logo`} 
                className="max-w-[60px] sm:max-w-[80px] h-3 sm:h-4 object-contain opacity-90 hover:opacity-100 transition-opacity"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary flex items-center justify-center shadow-soft"
          >
            <Sparkles size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
          </motion.div>
          <span className="font-display text-base sm:text-lg font-bold tracking-tight text-ink">AI interview</span>
        </Link>

        {/* Desktop nav */}
        {!isHome && (
          <nav className="hidden md:flex items-center gap-1 bg-surface border border-border rounded-full px-1.5 py-1.5 shadow-soft">
            {navLinks.map(([label, to]) => (
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

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={toggleTheme}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface border border-border flex items-center justify-center text-ink-soft hover:text-primary hover:border-primary/30 transition-colors"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface border border-border flex items-center justify-center text-ink-soft hover:text-primary hover:border-primary/30 transition-colors">
            <Bell size={15} />
          </button>
          {localStorage.getItem("userId") ? (
            <div className="hidden sm:flex items-center gap-2">
              {/* Admin Panel Button — only shown when isAdmin */}
              {isAdmin && (
                <Link
                  to={isAdminPage ? "/dashboard" : "/admin"}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-lavender text-white shadow-soft hover:opacity-90 transition-opacity"
                >
                  <Shield size={12} />
                  {isAdminPage ? "Main Site" : "Admin"}
                </Link>
              )}
              <Link
                to="/profile"
                className="w-9 h-9 rounded-full bg-primary-soft border border-border flex items-center justify-center text-primary hover:shadow-glow transition-shadow"
              >
                <User size={16} />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-ink-soft hover:text-primary hover:border-primary/30 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="text-sm px-3 py-1.5 rounded-full bg-surface border border-border text-ink-soft hover:text-ink">
                Log in
              </Link>
              <Link to="/register" className="text-sm px-3 py-1.5 rounded-full bg-primary text-white hover:opacity-90">
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface border border-border flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden overflow-hidden bg-surface border-b border-border shadow-lg"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(([label, to]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === to
                      ? "bg-primary-soft text-primary"
                      : "text-ink-soft hover:text-ink hover:bg-paper"
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="border-t border-border pt-3 mt-3 flex flex-col gap-2">
                {isAdmin && (
                  <Link
                    to={isAdminPage ? "/dashboard" : "/admin"}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 text-sm px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary to-lavender text-white font-semibold"
                  >
                    <Shield size={14} />
                    {isAdminPage ? "Go to Main Site" : "Admin Panel"}
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  {localStorage.getItem("userId") ? (
                    <>
                      <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm px-3 py-2 rounded-xl bg-primary-soft text-primary font-medium">
                        Profile
                      </Link>
                      <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="flex-1 text-center text-sm px-3 py-2 rounded-xl bg-surface border border-border text-ink-soft font-medium">
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm px-3 py-2 rounded-xl bg-surface border border-border text-ink-soft font-medium">
                        Log in
                      </Link>
                      <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm px-3 py-2 rounded-xl bg-primary text-white font-medium">
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
