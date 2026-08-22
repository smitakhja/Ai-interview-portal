import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target, Zap, Building2, Play, Clock } from "lucide-react";
import AmbientBlobs from "../components/AmbientBlobs.jsx";
import ReadinessRing from "../components/ReadinessRing.jsx";
import { modules, colorMap, COMPANY_LOGOS } from "../modules.js";
import api from "../api.js";

const TRACKED = modules.slice(0, 5); // the 5 practice modules

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};



export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/progress").then((res) => setData(res.data)).catch(() => {});
  }, []);

  const readiness = data?.readiness || 0;

  return (
    <div className="relative overflow-hidden">
      <AmbientBlobs />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-10 sm:pb-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 bg-surface/60 backdrop-blur-md border border-border rounded-full px-4 py-1.5 text-xs font-semibold text-primary shadow-soft mb-6"
          >
            <Sparkles size={14} className="text-primary" /> Your AI Interview Portal
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-3xl sm:text-5xl md:text-[64px] font-bold tracking-tight text-ink leading-[1.1] sm:leading-[1.05]"
          >
            Walk into every
            <br />
            interview <span className="text-primary relative inline-block">
              already prepared.
              <motion.span
                className="absolute -bottom-2 left-0 w-full h-1 bg-primary/20 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.8, ease: "circOut" }}
                style={{ originX: 0 }}
              />
            </span>
          </motion.h1>

          <motion.p variants={item} className="mt-4 sm:mt-6 text-base sm:text-lg text-ink-soft max-w-xl leading-relaxed">
            Prepr reviews your resume, runs mock interviews, and quizzes you on
            technical, aptitude, and HR rounds — then tracks exactly how ready
            you are, module by module.
          </motion.p>

          <motion.div variants={item} className="mt-6 sm:mt-10 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            <Link to="/dashboard" className="btn-primary group text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5">
              Go to Dashboard
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/company-interviews" className="btn-secondary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 group">
              <Play size={18} className="text-ink-soft group-hover:text-ink transition-colors" /> Watch Interviews
            </Link>
          </motion.div>

          <motion.div variants={item} className="mt-8 sm:mt-12 flex flex-wrap items-center gap-4 sm:gap-8 border-t border-border/50 pt-6 sm:pt-8">
            <Stat icon={Target} value="7" label="Prep modules" />
            <Stat icon={Zap} value="Instant" label="AI feedback" />
            <Stat icon={Building2} value="Top" label="Company Qs" />
          </motion.div>you q1 
        </motion.div>

        {/* ── Right side: Readiness Ring only ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative"
        >
          <div className="card p-5 sm:p-8 relative overflow-hidden backdrop-blur-xl bg-surface/80 border-white/40 shadow-[0_20px_60px_-15px_rgba(52,87,213,0.15)]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-display font-semibold text-ink text-lg">Your readiness</p>
                <p className="text-sm text-ink-soft">Across all modules, updated live</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center">
                <Target size={18} className="text-primary" />
              </div>
            </div>

            <div className="flex justify-center my-8 relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-dashed border-primary/20 scale-125"
              />
              <ReadinessRing value={readiness} label="Overall readiness" size={160} stroke={12} />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {modules.slice(0, 4).map((m, i) => (
                <motion.div
                  key={m.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (i * 0.1) }}
                  className="flex items-center gap-2 bg-surface/50 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-border/50 hover:bg-surface transition-colors"
                >
                  <m.icon size={15} className={`text-${m.color} shrink-0`} />
                  <span className="text-xs font-semibold text-ink-soft truncate">{m.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Glowing background blob */}
            <motion.div
              className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl -z-10"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>



      {/* Flow strip: Home -> Dashboard -> modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint mb-2">How it flows</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Your path to readiness</h2>
        </div>
        
        <div className="card p-4 sm:p-8 overflow-x-auto relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white bg-surface/50 backdrop-blur-md scrollbar-hide -mx-4 sm:mx-0 rounded-none sm:rounded-xl2">
          <div className="flex items-center min-w-max gap-3 sm:gap-4 px-4 sm:px-0 py-2 sm:py-0">
            <FlowNode label="Dashboard" active to="/dashboard" />
            {modules.slice(0, 6).map((m, i) => (
              <span key={m.key} className="flex items-center gap-3 sm:gap-4">
                <FlowArrow />
                <FlowNode label={m.label} icon={m.icon} color={m.color} to={m.to} index={i} />
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center text-primary shadow-inner">
        <Icon size={18} />
      </div>
      <div>
        <p className="font-display font-bold text-xl text-ink leading-none">{value}</p>
        <p className="text-xs font-medium text-ink-soft mt-1">{label}</p>
      </div>
    </div>
  );
}

function FlowNode({ label, active, icon: Icon, to, index = 0 }) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.05, y: -2 }}
      className={`flex flex-col items-center gap-3 px-2 cursor-pointer ${
        active ? "" : "opacity-80 hover:opacity-100"
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-soft transition-all duration-300 ${
        active 
          ? "bg-primary text-white shadow-glow" 
          : "bg-surface border border-border text-ink hover:border-primary hover:text-primary"
      }`}>
        {Icon ? <Icon size={22} /> : <Target size={22} />}
      </div>
      <span className={`text-sm font-semibold ${active ? "text-primary" : "text-ink-soft"}`}>
        {label}
      </span>
    </motion.div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

function FlowArrow() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="text-border shrink-0"
    >
      <ArrowRight size={20} className="stroke-[3]" />
    </motion.div>
  );
}
