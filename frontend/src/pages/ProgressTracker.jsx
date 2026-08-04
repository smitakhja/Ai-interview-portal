import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import PageShell from "../components/PageShell.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import ReadinessRing from "../components/ReadinessRing.jsx";
import { modules, colorMap } from "../modules.js";
import api from "../api.js";

const TRACKED = modules.slice(0, 5); // the 5 practice modules

export default function ProgressTracker() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/progress").then((res) => setData(res.data));
  }, []);

  return (
    <PageShell>
      <Breadcrumb trail={[{ label: "Home", to: "/" }, { label: "Dashboard", to: "/dashboard" }, { label: "Progress Tracker" }]} />

      <h1 className="font-display text-3xl font-bold text-ink mb-2">Progress Tracker</h1>
      <p className="text-ink-soft mb-8">See how your readiness is building across every module.</p>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <div className="card p-8 flex flex-col items-center h-fit">
          <ReadinessRing value={data?.readiness || 0} size={160} label="Overall readiness" />
          <p className="text-xs text-ink-soft mt-5 text-center leading-relaxed">
            Your average best score across Resume, Mock Interview, Quiz, Aptitude, and HR rounds.
          </p>
        </div>

        <div className="space-y-4">
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

          <div className="card p-5">
            <p className="font-semibold text-sm text-ink mb-3">Recent activity</p>
            {data?.history?.length ? (
              <ul className="space-y-2.5">
                {data.history.slice(0, 6).map((h, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink-soft">
                      <Clock size={13} className="text-ink-faint" />
                      {modules.find((m) => m.key === h.module)?.label || h.module}
                    </span>
                    <span className="font-semibold text-ink">{h.score}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-ink-faint">No activity yet — try a module from the Dashboard.</p>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
