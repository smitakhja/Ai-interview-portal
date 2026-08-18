import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Bot, ListChecks, BrainCircuit, FileText, Clock, Trophy, Loader2 } from "lucide-react";
import PageShell from "../components/PageShell.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import ReadinessRing from "../components/ReadinessRing.jsx";
import { modules, colorMap } from "../modules.js";
import api from "../api.js";

const RADIUS = 260;

const TYPE_ICONS = {
  interview: Bot,
  quiz: ListChecks,
  aptitude: BrainCircuit,
  resume: FileText,
};

export default function Dashboard() {
  const [readiness, setReadiness] = useState(0);
  const [progress, setProgress] = useState({});
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load both progress (for module bars) and dashboard (for stats + activity)
    Promise.allSettled([
      api.get("/progress"),
      api.get("/dashboard"),
    ]).then(([progressRes, dashRes]) => {
      if (progressRes.status === "fulfilled") {
        setReadiness(progressRes.value.data.readiness || 0);
        setProgress(progressRes.value.data);
      }
      if (dashRes.status === "fulfilled" && dashRes.value.data.success) {
        const d = dashRes.value.data.data;
        setDashboard(d);
        // Use the richer readiness from dashboard if available
        if (d.overallReadiness > 0) setReadiness(d.overallReadiness);
      }
    }).finally(() => setLoading(false));
  }, []);

  const spokes = modules.slice(0, 6);

  return (
    <PageShell>
      <Breadcrumb trail={[{ label: "Home", to: "/" }, { label: "Dashboard" }]} />

      <div className="flex flex-wrap items-end justify-between gap-4 mb-6 sm:mb-10">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            {dashboard?.profile?.name ? `Welcome back, ${dashboard.profile.name.split(" ")[0]}!` : "Your prep hub"}
          </h1>
          <p className="text-ink-soft mt-1">Pick a module to continue building your readiness.</p>
        </div>

        {/* Quick Stats */}
        {dashboard && (
          <div className="flex items-center gap-3 flex-wrap">
            <StatPill icon={Bot} label="Interviews" value={dashboard.interviewCount} color="primary" />
            <StatPill icon={ListChecks} label="Quizzes" value={dashboard.quizCount} color="mint" />
            <StatPill icon={FileText} label="Resumes" value={dashboard.resumeCount} color="lavender" />
          </div>
        )}
      </div>

      {/* Radial hub — desktop */}
      <div className="hidden lg:flex justify-center items-center relative" style={{ height: RADIUS * 2 + 140 }}>
        <div className="relative" style={{ width: RADIUS * 2 + 140, height: RADIUS * 2 + 140 }}>
          {/* connecting lines */}
          <svg className="absolute inset-0" width="100%" height="100%">
            {spokes.map((_, i) => {
              const angle = (i / spokes.length) * 2 * Math.PI - Math.PI / 2;
              const cx = RADIUS + 70;
              const cy = RADIUS + 70;
              const x = cx + RADIUS * Math.cos(angle);
              const y = cy + RADIUS * Math.sin(angle);
              return (
                <motion.line
                  key={i}
                  x1={cx} y1={cy} x2={x} y2={y}
                  stroke="#E4E9F2" strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 * i }}
                />
              );
            })}
          </svg>

          {/* hub */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="absolute z-10 card flex flex-col items-center justify-center p-6"
            style={{ width: 180, height: 180, left: RADIUS + 70 - 90, top: RADIUS + 70 - 90, borderRadius: "9999px" }}
          >
            <ReadinessRing value={readiness} size={140} stroke={10} />
          </motion.div>

          {/* spokes */}
          {spokes.map((m, i) => {
            const angle = (i / spokes.length) * 2 * Math.PI - Math.PI / 2;
            const cx = RADIUS + 70;
            const cy = RADIUS + 70;
            const x = cx + RADIUS * Math.cos(angle);
            const y = cy + RADIUS * Math.sin(angle);
            const c = colorMap[m.color];
            const best = progress[m.key]?.bestScore;

            return (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 * i + 0.3, type: "spring", stiffness: 140, damping: 12 }}
                whileHover={{ scale: 1.06, y: -4 }}
                className="absolute z-10"
                style={{ left: x - 84, top: y - 60, width: 168 }}
              >
                <Link to={m.to} className="card p-4 flex flex-col gap-2 group hover:shadow-card transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-lg ${c.bg} ${c.text} flex items-center justify-center`}>
                      <m.icon size={16} />
                    </div>
                    <ArrowUpRight size={14} className="text-ink-faint group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <p className="text-sm font-semibold text-ink leading-tight">{m.label}</p>
                  {typeof best === "number" && (
                    <div className="h-1.5 rounded-full bg-paper overflow-hidden">
                      <div className={`h-full ${c.solid}`} style={{ width: `${best}%` }} />
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Grid fallback — mobile/tablet */}
      <div className="lg:hidden">
        <div className="flex justify-center mb-8">
          <div className="card p-6 flex flex-col items-center">
            <ReadinessRing value={readiness} size={140} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {modules.map((m) => {
            const c = colorMap[m.color];
            return (
              <Link key={m.key} to={m.to} className="card p-5 flex items-start gap-3 hover:shadow-card transition-shadow">
                <div className={`w-10 h-10 rounded-lg ${c.bg} ${c.text} flex items-center justify-center shrink-0`}>
                  <m.icon size={18} />
                </div>
                <div>
                  <p className="font-semibold text-ink">{m.label}</p>
                  <p className="text-xs text-ink-soft mt-1">{m.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {dashboard?.recentActivity?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 card p-5 sm:p-6"
        >
          <h2 className="font-display font-bold text-ink text-base mb-4 flex items-center gap-2">
            <Clock size={16} className="text-primary" /> Recent Activity
          </h2>
          <div className="space-y-3">
            {dashboard.recentActivity.map((a, i) => {
              const Icon = TYPE_ICONS[a.type] || Trophy;
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-paper rounded-xl border border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{a.label}</p>
                    <p className="text-xs text-ink-faint">{new Date(a.date).toLocaleDateString()}</p>
                  </div>
                  {typeof a.score === "number" && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      a.score >= 80 ? "bg-mint-soft text-mint" :
                      a.score >= 55 ? "bg-amber-soft text-amber" :
                      "bg-coral-soft text-coral"
                    }`}>
                      {a.score}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Profile quick link */}
      <div className="hidden lg:flex justify-center mt-4">
        <Link to="/profile" className="btn-secondary text-sm">Go to Profile</Link>
      </div>
    </PageShell>
  );
}

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className={`flex items-center gap-2 bg-${color}-soft border border-${color}/20 rounded-full px-3 py-1.5`}>
      <Icon size={13} className={`text-${color}`} />
      <span className={`text-xs font-semibold text-${color}`}>{value} {label}</span>
    </div>
  );
}
