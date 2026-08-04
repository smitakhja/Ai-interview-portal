import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import api from "../api.js";
import { Chrome, Apple } from "lucide-react";

export default function Register() {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    const id = (userId || name).trim().toLowerCase().replace(/\s+/g, "-") || "demo-user";

    const profile = {
      name: name || "Demo User",
      email: email || "demo@example.com",
      targetRole: "",
      experience: "Fresher / Student",
      skills: [],
      avatarColor: "#3457D5",
    };

    // Try to create on backend; if it fails, fall back to localStorage
    try {
      await api.post("/profile", { profile }, { headers: { "x-user-id": id } });
    } catch (err) {
      localStorage.setItem(`userProfile_${id}`, JSON.stringify(profile));
    }

    localStorage.setItem("userId", id);
    navigate("/dashboard");
  }

  return (
    <PageShell>
      <div className="max-w-md mx-auto mt-12">
        <h1 className="text-2xl font-bold mb-4">Create an account</h1>

        <form onSubmit={submit} className="card p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink-soft mb-1.5 block">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft mb-1.5 block">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft mb-1.5 block">User ID (optional)</label>
            <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="username (e.g. alice)" className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <p className="text-xs text-ink-soft mt-2">This will be used to identify your account locally.</p>
          </div>

          <div className="flex justify-end mb-2">
            <button className="btn-primary w-full" type="submit">Create account</button>
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
              onClick={() => {
                setUserId("google-user");
                setName("Google User");
                setEmail("google@example.com");
                submit({ preventDefault: () => {} });
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-white text-ink font-semibold px-4 py-2.5 border border-border transition-all duration-200 hover:shadow-soft hover:border-border/80"
            >
              <Chrome size={18} className="text-[#4285F4]" />
              <span className="text-sm">Google</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUserId("apple-user");
                setName("Apple User");
                setEmail("apple@example.com");
                submit({ preventDefault: () => {} });
              }}
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
