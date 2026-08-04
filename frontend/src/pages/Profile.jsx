import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Check, X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import api from "../api.js";

const DEFAULT_PROFILE = {
  name: "Aarav Mehta",
  email: "aarav.mehta@example.com",
  targetRole: "Software Engineer",
  experience: "1-3 years",
  skills: ["JavaScript", "React", "Node.js", "SQL"],
  avatarColor: "#3457D5",
};

function getStoredProfile(userId) {
  const stored = localStorage.getItem(`userProfile_${userId}`);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function saveStoredProfile(userId, profile) {
  localStorage.setItem(`userProfile_${userId}`, JSON.stringify(profile));
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "demo-user";

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    api
      .get("/profile")
      .then((res) => {
        setProfile(res.data || DEFAULT_PROFILE);
      })
      .catch(() => {
        const fallback = getStoredProfile(userId) || DEFAULT_PROFILE;
        setProfile(fallback);
      })
      .finally(() => setLoading(false));
  }, [navigate, userId]);

  function update(field, value) {
    setSaved(false);
    setProfile((p) => ({ ...p, [field]: value }));
  }

  function addSkill() {
    if (!newSkill.trim()) return;
    update("skills", [...(profile.skills || []), newSkill.trim()]);
    setNewSkill("");
  }

  function removeSkill(skill) {
    update("skills", profile.skills.filter((s) => s !== skill));
  }

  async function save() {
    try {
      const { data } = await api.put("/profile", profile);
      setProfile(data.profile);
      saveStoredProfile(userId, data.profile);
    } catch {
      saveStoredProfile(userId, profile);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto mt-12 text-center text-sm text-ink-soft">Loading profile…</div>
      </PageShell>
    );
  }

  if (!profile) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto mt-12 text-center text-sm text-ink-soft">No profile data found. Please log in or register.</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Breadcrumb trail={[{ label: "Home", to: "/" }, { label: "Dashboard", to: "/dashboard" }, { label: "Profile" }]} />

      <div className="max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-display font-bold text-xl shrink-0"
            style={{ background: profile.avatarColor || "#3457D5" }}
          >
            {profile.name?.[0] || "U"}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">{profile.name}</h1>
            <p className="text-sm text-ink-soft">{profile.targetRole}</p>
          </div>
        </div>

        <div className="card p-6 space-y-5">
          <Field label="Full name" value={profile.name} onChange={(v) => update("name", v)} />
          <Field label="Email" value={profile.email} onChange={(v) => update("email", v)} type="email" />
          <Field label="Target role" value={profile.targetRole} onChange={(v) => update("targetRole", v)} />

          <div>
            <label className="text-xs font-semibold text-ink-soft mb-1.5 block">Experience level</label>
            <select
              value={profile.experience}
              onChange={(e) => update("experience", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {["Fresher / Student", "0-1 years", "1-3 years", "3-5 years", "5+ years"].map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft mb-2 block">Skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.skills?.map((s) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 bg-primary-soft text-primary text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  {s}
                  <button onClick={() => removeSkill(s)} className="hover:text-coral">
                    <X size={12} />
                  </button>
                </motion.span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Add a skill..."
                className="flex-1 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button onClick={addSkill} className="btn-secondary px-4">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        <button onClick={save} className="btn-primary mt-6">
          {saved ? <Check size={18} /> : <Save size={18} />}
          {saved ? "Saved!" : "Save changes"}
        </button>
      </div>
    </PageShell>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-semibold text-ink-soft mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}
