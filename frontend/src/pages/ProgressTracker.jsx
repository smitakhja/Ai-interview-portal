import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Bot, ListChecks, BrainCircuit, FileText, Trophy, Loader2 } from "lucide-react";
import PageShell from "../components/PageShell.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import ReadinessRing from "../components/ReadinessRing.jsx";
import { modules, colorMap } from "../modules.js";
import api from "../api.js";

const TRACKED = modules.slice(0, 5);

const TYPE_ICONS = {
  interview: Bot,
  quiz: ListChecks,
  aptitude: BrainCircuit,
  resume: FileText,
};

export default function ProgressTracker() {
  const [data, setData] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get("/progress"),
      api.get("/dashboard"),
    ]).then(([progressRes, dashRes]) => {
      if (progressRes.status === "fulfilled") setData(progressRes.value.data);
      if (dashRes.status === "fulfilled" && dashRes.value.data.success) {
        setDashboard(dashRes.value.data.data);
      }
    }).finally(() => setLoading(false));
  }, []);

  const readiness = dashboard?.overallReadiness || data?.readiness || 0;
  const recentActivity = dashboard?.recentActivity || [];

  return (
    <PageShell>
      <Breadcrumb trail={[{ label: "Home", to: "/" }, { label: "Dashboard", to: "/dashboard" }, { label: "Progress Tracker" }]} />

      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-2">Progress Tracker</h1>
      <p className="text-sm sm:text-base text-ink-soft mb-6 sm:mb-8">See how your readiness is building across every module.</p>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Readiness ring */}
          <div className="space-y-4">
            <div className="card p-5 sm:p-8 flex flex-col items-center">
              <ReadinessRing value={readiness} size={140} label="Overall readiness" />
              <p className="text-xs text-ink-soft mt-4 text-center leading-relaxed">
                Your average best score across Resume, Mock Interview, Quiz, Aptitude, and HR rounds.
              </p>
            </div>

            {/* Summary stats from dashboard */}
            {dashboard && (
              <div className="card p-5 space-y-3">
                <p className="font-semibold text-sm text-ink">Your Stats</p>
                <StatRow label="Interviews completed" value={dashboard.interviewCount} best={dashboard.bestInterviewScore} />
                <StatRow label="Quizzes completed" value={dashboard.quizCount} best={dashboard.bestQuizScore} />
                <StatRow label="Aptitude tests" value={dashboard.aptitudeCount} best={dashboard.bestAptitudeScore} />
                <StatRow label="Resumes analyzed" value={dashboard.resumeCount} best={dashboard.bestResumeScore} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Module progress bars */}
            {TRACKED.map((m, i) => {
              const c = colorMap[m.color];
              const stats = data?.[m.key] || { attempts: 0, bestScore: 0 };
              return (
                <motion.div
                  key={m.key}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="card p-5 flex items-center gap-5"
                >
                  <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.text} flex items-center justify-center shrink-0`}>
                    <m.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-semibold text-ink text-sm">{m.label}</p>
                      <span className="text-xs font-bold text-ink">{stats.bestScore}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-paper overflow-hidden">
                      <motion.div
                        className={`h-full ${c.solid}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.bestScore}%` }}
                        transition={{ duration: 0.8, delay: i * 0.06 }}
                      />
                    </div>
                    <p className="text-xs text-ink-faint mt-1.5">{stats.attempts} attempt{stats.attempts === 1 ? "" : "s"}</p>
                  </div>
                </motion.div>
              );
            })}

            {/* Real recent activity from dashboard */}
            <div className="card p-5">
              <p className="font-semibold text-sm text-ink mb-3">Recent activity</p>
              {recentActivity.length > 0 ? (
                <ul className="space-y-2.5">
                  {recentActivity.map((a, i) => {
                    const Icon = TYPE_ICONS[a.type] || Trophy;
                    return (
                      <li key={i} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-ink-soft">
                          <Icon size={13} className="text-ink-faint" />
                          {a.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-ink-faint">{new Date(a.date).toLocaleDateString()}</span>
                          {typeof a.score === "number" && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              a.score >= 80 ? "bg-mint-soft text-mint" :
                              a.score >= 55 ? "bg-amber-soft text-amber" :
                              "bg-coral-soft text-coral"
                            }`}>{a.score}%</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-ink-faint">No activity yet — try a module from the Dashboard.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function StatRow({ label, value, best }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-soft">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-ink">{value}</span>
        {best > 0 && <span className="text-xs text-ink-faint">best: {best}%</span>}
      </div>
    </div>
  );
}
