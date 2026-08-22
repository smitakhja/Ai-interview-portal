import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../components/PageShell.jsx";
import { Chrome, Loader2, AlertCircle, Sparkles, ArrowRight, X } from "lucide-react";
import api from "../api.js";
import { firebaseConfigured as FIREBASE_CONFIGURED } from "../firebase.js";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    const id = userId.trim() || "demo-user";
    setLoading(true);
    try {
      await api.post("/auth/login", { userId: id });
    } catch (err) {
      console.warn("API login failed (demo fallback):", err);
    } finally {
      localStorage.setItem("userId", id);
      setLoading(false);
      navigate("/dashboard");
    }
  }

  const handleGoogleSignIn = async () => {
    if (!FIREBASE_CONFIGURED) {
      setError(
        "Google Sign-In requires Firebase to be configured. Use Demo Mode to continue, or add your Firebase credentials to the .env file."
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { signInWithPopup } = await import("firebase/auth");
      const { auth, googleProvider } = await import("../firebase.js");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      localStorage.setItem("userId", user.uid);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.displayName);
      try {
        await api.post("/auth/login", {
          userId: user.uid,
          email: user.email,
          name: user.displayName,
        });
      } catch (err) {
        console.warn("Backend sync failed:", err);
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("Firebase Auth Error:", err);
      setError(
        err.code === "auth/popup-closed-by-user"
          ? "Sign-in popup was closed. Please try again."
          : err.code === "auth/api-key-not-valid.-please-pass-a-valid-api-key."
          ? "Invalid Firebase API key. Please configure your Firebase credentials in the .env file."
          : `Google sign-in failed: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="max-w-md mx-auto mt-8 sm:mt-16 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-primary-soft border border-primary/10 rounded-full px-4 py-1.5 text-xs font-semibold text-primary mb-4">
            <Sparkles size={13} /> AI Interview Portal
          </div>
          <h1 className="font-display text-3xl font-bold text-ink">Welcome back</h1>
          <p className="text-sm text-ink-soft mt-2">Sign in to continue your interview prep</p>
        </motion.div>

        <motion.div
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
                <button onClick={() => setError("")} className="shrink-0 hover:opacity-70">
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Demo Mode Form */}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink-soft mb-1.5 block">
                User ID <span className="text-ink-faint font-normal">(Demo Mode)</span>
              </label>
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter any id (e.g. alice, john123)"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 bg-paper placeholder:text-ink-faint transition-shadow"
                autoComplete="username"
              />
              <p className="text-xs text-ink-faint mt-2 leading-relaxed">
                Demo mode bypasses Firebase Auth and lets you explore all features with sample data.
              </p>
            </div>

            <button
              className="btn-primary w-full flex justify-center items-center gap-2 py-3"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} />
              )}
              {loading ? "Signing in…" : "Continue in Demo Mode"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-3 text-ink-faint uppercase tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-2.5 w-full rounded-xl bg-surface text-ink font-semibold px-4 py-3 border border-border transition-all duration-200 hover:shadow-soft hover:border-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin text-ink-soft" />
            ) : (
              <Chrome size={18} className="text-[#4285F4]" />
            )}
            <span className="text-sm">Sign in with Google</span>
            {!FIREBASE_CONFIGURED && (
              <span className="ml-auto text-[10px] font-normal text-ink-faint bg-paper border border-border rounded-full px-2 py-0.5">
                Setup required
              </span>
            )}
          </button>

          {!FIREBASE_CONFIGURED && (
            <p className="text-center text-xs text-ink-faint leading-relaxed">
              Google Sign-In needs a Firebase project.{" "}
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Set it up here
              </a>{" "}
              and add keys to <code className="bg-paper px-1 rounded text-[10px]">frontend/.env</code>
            </p>
          )}
        </motion.div>

        {/* Register link */}
        <p className="text-center text-sm text-ink-soft mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
