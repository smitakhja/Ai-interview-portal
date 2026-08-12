import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import { Chrome, Loader2 } from "lucide-react";
import api from "../api.js";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e, forceId = null) {
    if (e && e.preventDefault) e.preventDefault();
    
    const id = forceId || userId.trim() || "demo-user";
    setLoading(true);

    try {
      // Connect to the login API
      await api.post("/auth/login", { userId: id });
    } catch (err) {
      console.warn("API Login failed (demo mode fallback):", err);
    } finally {
      localStorage.setItem("userId", id);
      setLoading(false);
      navigate("/dashboard");
    }
  }

  return (
    <PageShell>
      <div className="max-w-md mx-auto mt-12">
        <h1 className="text-2xl font-bold mb-4">Log in</h1>
        <form onSubmit={submit} className="card p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink-soft mb-1.5 block">User ID</label>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter a user id (e.g. alice)"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-ink-soft mt-2">Signing in as a demo user will show sample data.</p>
          </div>

          <div className="flex justify-end mb-2">
            <button className="btn-primary w-full flex justify-center items-center gap-2" type="submit" disabled={loading}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-2 text-ink-faint uppercase tracking-wider">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => { setUserId("google-user"); submit(null, "google-user"); }}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-white text-ink font-semibold px-4 py-2.5 border border-border transition-all duration-200 hover:shadow-soft hover:border-border/80 disabled:opacity-50"
            >
              <Chrome size={18} className="text-[#4285F4]" />
              <span className="text-sm">Sign in with Google</span>
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
