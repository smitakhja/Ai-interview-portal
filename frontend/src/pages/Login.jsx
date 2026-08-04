import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import { Chrome, Apple } from "lucide-react";

export default function Login() {
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  function submit(e) {
    e.preventDefault();
    const id = userId.trim() || "demo-user";
    localStorage.setItem("userId", id);
    navigate("/dashboard");
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
            <button className="btn-primary w-full" type="submit">
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

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setUserId("google-user"); submit({ preventDefault: () => {} }); }}
              className="flex items-center justify-center gap-2 rounded-xl bg-white text-ink font-semibold px-4 py-2.5 border border-border transition-all duration-200 hover:shadow-soft hover:border-border/80"
            >
              <Chrome size={18} className="text-[#4285F4]" />
              <span className="text-sm">Google</span>
            </button>
            <button
              type="button"
              onClick={() => { setUserId("apple-user"); submit({ preventDefault: () => {} }); }}
              className="flex items-center justify-center gap-2 rounded-xl bg-ink text-white font-semibold px-4 py-2.5 border border-ink transition-all duration-200 hover:shadow-soft hover:bg-ink/90"
            >
              <Apple size={18} />
              <span className="text-sm">Apple</span>
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
