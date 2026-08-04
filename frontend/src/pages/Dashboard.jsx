import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import PageShell from "../components/PageShell.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import ReadinessRing from "../components/ReadinessRing.jsx";
import { modules, colorMap } from "../modules.js";
import api from "../api.js";

const RADIUS = 260;

export default function Dashboard() {
  const [readiness, setReadiness] = useState(0);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    api
      .get("/progress")
      .then((res) => {
        setReadiness(res.data.readiness || 0);
        setProgress(res.data);
      })
      .catch(() => setReadiness(0));
  }, []);

  const spokes = modules.slice(0, 6); // 6 spokes around the hub; Profile lives in the navbar

  return (
    <PageShell>
      <Breadcrumb trail={[{ label: "Home", to: "/" }, { label: "Dashboard" }]} />

      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Your prep hub</h1>
          <p className="text-ink-soft mt-1">Pick a module to continue building your readiness.</p>
        </div>
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
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="#E4E9F2"
                  strokeWidth="2"
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
            style={{
              width: 180,
              height: 180,
              left: RADIUS + 70 - 90,
              top: RADIUS + 70 - 90,
              borderRadius: "9999px",
            }}
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
                    <ArrowUpRight
                      size={14}
                      className="text-ink-faint group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
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

      {/* Profile quick link, always reachable */}
      <div className="hidden lg:flex justify-center mt-4">
        <Link to="/profile" className="btn-secondary text-sm">
          Go to Profile
        </Link>
      </div>
    </PageShell>
  );
}
