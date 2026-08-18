import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../components/PageShell.jsx";
import { Shield, Loader2, AlertCircle, X, Lock, Mail } from "lucide-react";
import api from "../api.js";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/admin/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("userId", "admin"); // so Navbar shows Admin button
        navigate("/admin");
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="max-w-md mx-auto mt-12 sm:mt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-lavender text-white shadow-glow mb-5">
            <Shield size={28} />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink">Admin Portal</h1>
          <p className="text-sm text-ink-soft mt-2">Sign in with your admin credentials</p>
        </motion.div>

        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 sm:p-8 space-y-5"
        >
          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 bg-coral-soft border border-coral/20 rounded-xl p-4 text-sm text-coral"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="flex-1 leading-relaxed">{error}</p>
                <button type="button" onClick={() => setError("")} className="shrink-0 hover:opacity-70">
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="text-xs font-semibold text-ink-soft mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aiportal.com"
                className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 bg-paper placeholder:text-ink-faint"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 bg-paper placeholder:text-ink-faint"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center gap-2 py-3"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
            {loading ? "Signing in…" : "Sign in as Admin"}
          </button>

          <div className="bg-paper border border-border rounded-xl p-4 mt-2">
            <p className="text-xs font-semibold text-ink-soft mb-2 flex items-center gap-1.5">
              <Lock size={12} /> Admin Credentials
            </p>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <span className="text-ink-faint">Email:</span>
              <code className="text-primary font-mono bg-primary-soft px-1.5 py-0.5 rounded">admin@aiportal.com</code>
              <span className="text-ink-faint">Password:</span>
              <code className="text-primary font-mono bg-primary-soft px-1.5 py-0.5 rounded">Admin@2024</code>
            </div>
          </div>
        </motion.form>

        <p className="text-center text-sm text-ink-soft mt-6">
          Not an admin?{" "}
          <a href="/dashboard" className="text-primary font-semibold hover:underline">
            Go to main site
          </a>
        </p>
      </div>
    </PageShell>
  );
}
