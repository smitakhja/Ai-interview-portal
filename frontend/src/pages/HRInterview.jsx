import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Lightbulb, Send, Loader2, Trophy, RotateCcw,
  ClipboardList, MessageSquare, CheckCircle2, XCircle,
  ChevronRight, BookOpen, SkipForward,
} from "lucide-react";
import PageShell from "../components/PageShell.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import api from "../api.js";

// ─── MCQ constants ────────────────────────────────────────────────────────────
const TIMER_SECS = 30;
const OPTION_LABELS = ["A", "B", "C", "D"];
const CATEGORY_COLORS = {
  Teamwork: "coral",
  Leadership: "primary",
  Adaptability: "mint",
  Communication: "lavender",
  "Work Ethic": "amber",
  "Conflict Resolution": "coral",
  "Time Management": "mint",
  Motivation: "lavender",
  "Decision Making": "primary",
  Professionalism: "amber",
};
function catColor(c) { return CATEGORY_COLORS[c] || "primary"; }

// ─── Main component ───────────────────────────────────────────────────────────
export default function HRInterview() {
  // shared
  const [mode, setMode]   = useState(null); // null | "open" | "mcq"
  const [stage, setStage] = useState("intro"); // intro | open_q | open_summary | mcq_q | mcq_result
  const [loading, setLoading] = useState(false);

  // ── open-ended state ──────────────────────────────────────────────────────
  const [openQuestions, setOpenQuestions] = useState([]);
  const [openIndex, setOpenIndex]         = useState(0);
  const [answer, setAnswer]               = useState("");
  const [feedback, setFeedback]           = useState(null);
  const [openResults, setOpenResults]     = useState([]);

  // ── MCQ state ─────────────────────────────────────────────────────────────
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [mcqIndex, setMcqIndex]         = useState(0);
  const [selected, setSelected]         = useState(null);
  const [submitted, setSubmitted]       = useState(false);
  const [mcqAnswers, setMcqAnswers]     = useState([]);
  const [timeLeft, setTimeLeft]         = useState(TIMER_SECS);
  const [mcqResult, setMcqResult]       = useState(null);
  const timerRef = useRef(null);

  // ─── reset everything back to intro ────────────────────────────────────────
  function resetAll() {
    setMode(null);
    setStage("intro");
    setOpenQuestions([]); setOpenIndex(0); setAnswer(""); setFeedback(null); setOpenResults([]);
    setMcqQuestions([]); setMcqIndex(0); setSelected(null); setSubmitted(false);
    setMcqAnswers([]); setTimeLeft(TIMER_SECS); setMcqResult(null);
    stopTimer();
  }

  // ─── MCQ timer helpers ─────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const goNextMCQ = useCallback((chosenIdx, allAnswers) => {
    stopTimer();
    const currentQ = mcqQuestions[mcqIndex];
    const nextAnswers = [...allAnswers, { id: currentQ.id, selected: chosenIdx ?? null }];
    if (mcqIndex + 1 < mcqQuestions.length) {
      setMcqAnswers(nextAnswers);
      setMcqIndex(i => i + 1);
      setSelected(null);
      setSubmitted(false);
      setTimeLeft(TIMER_SECS);
    } else {
      submitMCQ(nextAnswers);
    }
  }, [mcqQuestions, mcqIndex, stopTimer]);

  const lockMCQ = useCallback((chosenIdx, currentAnswers) => {
    stopTimer();
    setSubmitted(true);
    setSelected(chosenIdx ?? null);
    setTimeout(() => goNextMCQ(chosenIdx, currentAnswers), 1200);
  }, [stopTimer, goNextMCQ]);

  // Start MCQ timer whenever stage=mcq_q or mcqIndex changes
  useEffect(() => {
    if (stage !== "mcq_q") return;
    setTimeLeft(TIMER_SECS);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { lockMCQ(null, mcqAnswers); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => stopTimer();
  }, [stage, mcqIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Open-ended API ────────────────────────────────────────────────────────
  async function startOpen() {
    setLoading(true);
    const { data } = await api.get("/hr/questions", { params: { count: 5 } });
    setOpenQuestions(data.questions);
    setOpenIndex(0); setOpenResults([]); setFeedback(null); setAnswer("");
    setMode("open"); setStage("open_q");
    setLoading(false);
  }

  async function submitOpenAnswer() {
    if (!answer.trim()) return;
    setLoading(true);
    const q = openQuestions[openIndex];
    const { data } = await api.post("/hr/answer", { question: q.question, keywords: q.keywords, answer });
    setFeedback(data);
    setOpenResults(r => [...r, data]);
    setLoading(false);
  }

  async function nextOpen() {
    setFeedback(null); setAnswer("");
    if (openIndex + 1 < openQuestions.length) {
      setOpenIndex(openIndex + 1);
    } else {
      const avg = Math.round(openResults.reduce((s, r) => s + r.score, 0) / openResults.length);
      await api.post("/progress/update", { module: "hrInterview", score: avg });
      setStage("open_summary");
    }
  }

  // ─── MCQ API ───────────────────────────────────────────────────────────────
  async function startMCQ() {
    setLoading(true);
    try {
      const { data } = await api.get("/hr/mcq/questions", { params: { count: 10 } });
      setMcqQuestions(data.questions);
      setMcqAnswers([]); setMcqIndex(0); setSelected(null); setSubmitted(false); setMcqResult(null);
      setMode("mcq"); setStage("mcq_q");
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function submitMCQ(finalAnswers) {
    stopTimer();
    setStage("mcq_result");
    setLoading(true);
    try {
      const { data } = await api.post("/hr/mcq/submit", { answers: finalAnswers });
      await api.post("/progress/update", { module: "hrInterview", score: data.score });
      setMcqResult(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function handleMCQSelect(optIdx) {
    if (submitted) return;
    lockMCQ(optIdx, mcqAnswers);
  }

  // ─── Derived values ────────────────────────────────────────────────────────
  const openAvg = openResults.length
    ? Math.round(openResults.reduce((s, r) => s + r.score, 0) / openResults.length) : 0;
  const mcqQ = mcqQuestions[mcqIndex];
  const mcqProgress = mcqQuestions.length ? (mcqIndex / mcqQuestions.length) * 100 : 0;
  const timerPct = (timeLeft / TIMER_SECS) * 100;
  const timerColor = timeLeft > 15 ? "#0FA98A" : timeLeft > 8 ? "#F59E0B" : "#EF4444";

  return (
    <PageShell>
      <Breadcrumb trail={[{ label: "Home", to: "/" }, { label: "Dashboard", to: "/dashboard" }, { label: "HR Interview" }]} />

      <AnimatePresence mode="wait">

        {/* ════════════════════════════════════════════
            INTRO — mode picker
        ════════════════════════════════════════════ */}
        {stage === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl">
            <div className="w-14 h-14 rounded-2xl bg-coral-soft text-coral flex items-center justify-center mb-5 shadow-soft">
              <Users size={24} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-2">HR Interview</h1>
            <p className="text-sm sm:text-base text-ink-soft mb-8">
              Choose how you want to practice — type out detailed answers or take a quick timed MCQ round.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Open-ended card */}
              <motion.button
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={startOpen}
                disabled={loading}
                className="card p-6 text-left border-2 border-border hover:border-coral transition-colors group"
              >
                <div className="w-11 h-11 rounded-xl bg-coral-soft text-coral flex items-center justify-center mb-4">
                  <MessageSquare size={20} />
                </div>
                <p className="font-display font-bold text-ink text-base mb-1 group-hover:text-coral transition-colors">
                  Open-ended Interview
                </p>
                <p className="text-xs text-ink-soft leading-relaxed">
                  5 behavioral questions. Type your answer, get instant AI feedback and a score.
                </p>
                <div className="mt-4 flex gap-2">
                  {["5 Questions", "Text answers", "AI feedback"].map(t => (
                    <span key={t} className="text-[10px] font-semibold bg-coral-soft text-coral px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
                {loading && mode === "open" && <Loader2 size={16} className="animate-spin mt-3 text-coral" />}
              </motion.button>

              {/* MCQ card */}
              <motion.button
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={startMCQ}
                disabled={loading}
                className="card p-6 text-left border-2 border-border hover:border-primary transition-colors group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-4">
                  <ClipboardList size={20} />
                </div>
                <p className="font-display font-bold text-ink text-base mb-1 group-hover:text-primary transition-colors">
                  MCQ Round
                </p>
                <p className="text-xs text-ink-soft leading-relaxed">
                  10 situational MCQs. 30 seconds per question — auto-advances when time runs out.
                </p>
                <div className="mt-4 flex gap-2">
                  {["10 Questions", "30s timer", "Auto-advance"].map(t => (
                    <span key={t} className="text-[10px] font-semibold bg-primary-soft text-primary px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
                {loading && mode === "mcq" && <Loader2 size={16} className="animate-spin mt-3 text-primary" />}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════
            OPEN-ENDED — question
        ════════════════════════════════════════════ */}
        {stage === "open_q" && openQuestions[openIndex] && (
          <motion.div key="open_q" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-ink-faint">
                Question {openIndex + 1} of {openQuestions.length}
              </span>
              <div className="h-1.5 w-40 bg-border rounded-full overflow-hidden">
                <motion.div className="h-full bg-coral" animate={{ width: `${((openIndex + 1) / openQuestions.length) * 100}%` }} />
              </div>
            </div>

            <div className="card p-6 mb-4">
              <p className="font-medium text-ink mb-3">{openQuestions[openIndex].question}</p>
              <div className="flex items-start gap-2 bg-amber-soft text-amber-900 text-xs rounded-lg px-3 py-2">
                <Lightbulb size={14} className="shrink-0 mt-0.5 text-amber" />
                <span className="text-ink-soft">{openQuestions[openIndex].tip}</span>
              </div>
            </div>

            {!feedback ? (
              <>
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  rows={5}
                  placeholder="Type your answer..."
                  className="w-full card p-4 text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-coral/30"
                />
                <button onClick={submitOpenAnswer} disabled={loading || !answer.trim()} className="btn-primary bg-coral hover:bg-coral mt-4 disabled:opacity-50">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                  Submit answer
                </button>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="font-display text-2xl font-bold text-coral">{feedback.score}</div>
                  <span className="text-xs text-ink-soft">/ 100</span>
                </div>
                <p className="text-sm text-ink-soft mb-4">{feedback.feedback}</p>
                <button onClick={nextOpen} className="btn-primary bg-coral hover:bg-coral">
                  {openIndex + 1 < openQuestions.length ? "Next question" : "See summary"}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ════════════════════════════════════════════
            OPEN-ENDED — summary
        ════════════════════════════════════════════ */}
        {stage === "open_summary" && (
          <motion.div key="open_summary" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg card p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-coral-soft text-coral flex items-center justify-center mx-auto mb-4">
              <Trophy size={26} />
            </div>
            <p className="font-display text-4xl font-bold text-ink">{openAvg}%</p>
            <p className="text-ink-soft mt-2">Average across {openResults.length} answers</p>
            <div className="flex justify-center gap-3 mt-8">
              <button onClick={resetAll} className="btn-secondary">
                <RotateCcw size={16} /> Back to HR Menu
              </button>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════
            MCQ — question with 30s timer
        ════════════════════════════════════════════ */}
        {stage === "mcq_q" && mcqQ && (
          <motion.div
            key={`mcq_q_${mcqIndex}`}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="max-w-2xl w-full"
          >
            {/* Top bar: progress label + circular timer */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-ink-faint">
                Question {mcqIndex + 1} / {mcqQuestions.length}
              </span>
              <div className="relative w-12 h-12">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#E8ECF4" strokeWidth="4" />
                  <circle
                    cx="24" cy="24" r="20" fill="none"
                    stroke={timerColor} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - timerPct / 100)}`}
                    style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s" }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: timerColor }}>
                  {timeLeft}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-border rounded-full mb-6 overflow-hidden">
              <motion.div className="h-full bg-coral rounded-full" animate={{ width: `${mcqProgress}%` }} transition={{ duration: 0.4 }} />
            </div>

            {/* Question card */}
            <div className="card p-6 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full bg-${catColor(mcqQ.category)}-soft text-${catColor(mcqQ.category)}`}>
                  {mcqQ.category}
                </span>
              </div>
              <p className="font-semibold text-ink text-base sm:text-lg leading-snug">{mcqQ.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-5">
              {mcqQ.options.map((opt, oi) => {
                let cls = "w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-sm font-medium ";
                if (!submitted) {
                  cls += selected === oi
                    ? "border-coral bg-coral-soft text-ink shadow-soft"
                    : "border-border text-ink-soft hover:border-coral/50 hover:bg-coral-soft/40 hover:text-ink";
                } else {
                  cls += (oi === selected && selected !== null)
                    ? "border-coral bg-coral-soft text-ink"
                    : "border-border text-ink-faint opacity-60";
                }
                return (
                  <motion.button
                    key={oi}
                    whileHover={!submitted ? { scale: 1.01 } : {}}
                    whileTap={!submitted ? { scale: 0.99 } : {}}
                    onClick={() => handleMCQSelect(oi)}
                    disabled={submitted}
                    className={cls}
                  >
                    <span className="w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center text-xs font-bold text-ink-soft shrink-0">
                      {OPTION_LABELS[oi]}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </motion.button>
                );
              })}
            </div>

            {!submitted && (
              <button onClick={() => lockMCQ(null, mcqAnswers)} className="btn-secondary text-xs px-4 py-2 gap-1.5">
                <SkipForward size={14} /> Skip
              </button>
            )}
            {submitted && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-xs text-ink-soft">
                <ChevronRight size={14} className="animate-pulse text-coral" /> Loading next question…
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ════════════════════════════════════════════
            MCQ — results
        ════════════════════════════════════════════ */}
        {stage === "mcq_result" && (
          <motion.div key="mcq_result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-20">
                <Loader2 size={32} className="animate-spin text-coral" />
                <p className="text-sm text-ink-soft">Scoring your answers…</p>
              </div>
            ) : mcqResult ? (
              <>
                {/* Score hero */}
                <div className="card p-8 text-center mb-6 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-coral/5 to-transparent pointer-events-none"
                    animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 4, repeat: Infinity }}
                  />
                  <div className="w-16 h-16 rounded-full bg-coral-soft text-coral flex items-center justify-center mx-auto mb-4">
                    <Trophy size={28} />
                  </div>
                  <p className="font-display text-5xl font-bold text-coral">{mcqResult.score}%</p>
                  <p className="text-ink-soft mt-2 text-sm">{mcqResult.correctCount} of {mcqResult.total} correct</p>
                  <p className="text-xs text-ink-faint mt-1">
                    {mcqResult.score >= 80 ? "🎉 Excellent performance!" : mcqResult.score >= 60 ? "👍 Good effort — keep practicing!" : "📚 Review the explanations and try again."}
                  </p>
                </div>

                {/* Category breakdown */}
                {Object.keys(mcqResult.byCategory || {}).length > 0 && (
                  <div className="card p-5 mb-6">
                    <p className="text-xs font-semibold text-ink-faint uppercase tracking-widest mb-4">By Category</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(mcqResult.byCategory).map(([cat, v]) => {
                        const pct = Math.round((v.correct / Math.max(v.total, 1)) * 100);
                        const cc = catColor(cat);
                        return (
                          <div key={cat} className={`rounded-xl p-3 bg-${cc}-soft`}>
                            <p className={`text-xs font-semibold text-${cc} truncate`}>{cat}</p>
                            <p className="font-display font-bold text-ink mt-1">{v.correct}/{v.total}</p>
                            <div className="h-1.5 bg-white/60 rounded-full mt-2 overflow-hidden">
                              <div className={`h-full bg-${cc} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Per-question review */}
                <div className="card p-5 mb-6">
                  <p className="text-xs font-semibold text-ink-faint uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BookOpen size={13} /> Answer Review
                  </p>
                  <div className="space-y-4">
                    {mcqResult.breakdown.map((b, i) => {
                      const origQ = mcqQuestions[i];
                      if (!origQ) return null;
                      return (
                        <div key={b.id} className="border border-border rounded-xl p-4">
                          <div className="flex items-start gap-2 mb-2">
                            {b.correct
                              ? <CheckCircle2 size={16} className="text-mint shrink-0 mt-0.5" />
                              : <XCircle size={16} className="text-coral shrink-0 mt-0.5" />}
                            <p className="text-sm font-medium text-ink">{origQ.question}</p>
                          </div>
                          <div className="ml-6 space-y-1">
                            {origQ.options.map((opt, oi) => {
                              const isCorrect = oi === b.correctAnswer;
                              const wasChosen = oi === b.selected;
                              return (
                                <p key={oi} className={`text-xs rounded-lg px-2 py-1 ${
                                  isCorrect ? "bg-mint-soft text-mint font-semibold"
                                  : wasChosen && !isCorrect ? "bg-coral-soft text-coral line-through"
                                  : "text-ink-faint"}`}>
                                  {OPTION_LABELS[oi]}. {opt}
                                </p>
                              );
                            })}
                            {b.explanation && <p className="text-xs text-ink-soft mt-2 italic">{b.explanation}</p>}
                            {b.skipped && <p className="text-xs text-amber font-medium mt-1">⏰ Time expired — skipped</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={startMCQ} disabled={loading} className="btn-primary bg-coral hover:bg-coral">
                    <RotateCcw size={16} /> Try MCQ again
                  </button>
                  <button onClick={resetAll} className="btn-secondary">
                    Back to HR Menu
                  </button>
                </div>
              </>
            ) : null}
          </motion.div>
        )}

      </AnimatePresence>
    </PageShell>
  );
}
