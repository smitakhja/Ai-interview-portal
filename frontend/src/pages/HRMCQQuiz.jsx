import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, RotateCcw, Trophy, CheckCircle2, XCircle,
  Clock, ChevronRight, Loader2, BookOpen, SkipForward,
} from "lucide-react";
import PageShell from "../components/PageShell.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import api from "../api.js";

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

function categoryColor(cat) {
  return CATEGORY_COLORS[cat] || "primary";
}

export default function HRMCQQuiz() {
  const [stage, setStage] = useState("intro"); // intro | quiz | result
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null); // option index chosen for current question
  const [submitted, setSubmitted] = useState(false); // whether current Q was locked
  const [answers, setAnswers] = useState([]); // [{id, selected}]
  const [timeLeft, setTimeLeft] = useState(TIMER_SECS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  // ─── helpers ──────────────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goNext = useCallback(
    (chosenIndex, allAnswers) => {
      stopTimer();
      const currentQ = questions[index];
      const nextAnswers = [
        ...allAnswers,
        { id: currentQ.id, selected: chosenIndex ?? null },
      ];

      if (index + 1 < questions.length) {
        setAnswers(nextAnswers);
        setIndex((i) => i + 1);
        setSelected(null);
        setSubmitted(false);
        setTimeLeft(TIMER_SECS);
      } else {
        // Last question — submit
        finalSubmit(nextAnswers);
      }
    },
    [questions, index, stopTimer]
  );

  // lock the current selection (or null if skipped) and show feedback briefly
  const lockAnswer = useCallback(
    (chosenIndex, currentAnswers) => {
      stopTimer();
      setSubmitted(true);
      setSelected(chosenIndex ?? null);

      // Auto-advance after 1.2 s so user can read brief feedback
      setTimeout(() => goNext(chosenIndex, currentAnswers), 1200);
    },
    [stopTimer, goNext]
  );

  // ─── timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== "quiz") return;

    setTimeLeft(TIMER_SECS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Time's up — auto-advance with no answer
          lockAnswer(null, answers);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => stopTimer();
  }, [stage, index]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── API calls ────────────────────────────────────────────────────────────
  async function start() {
    setLoading(true);
    try {
      const { data } = await api.get("/hr/mcq/questions", { params: { count: 10 } });
      setQuestions(data.questions);
      setAnswers([]);
      setIndex(0);
      setSelected(null);
      setSubmitted(false);
      setResult(null);
      setStage("quiz");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function finalSubmit(finalAnswers) {
    stopTimer();
    setStage("result");
    setLoading(true);
    try {
      const { data } = await api.post("/hr/mcq/submit", { answers: finalAnswers });
      await api.post("/progress/update", { module: "hrInterview", score: data.score });
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(optIdx) {
    if (submitted) return;
    stopTimer();
    setSelected(optIdx);
    lockAnswer(optIdx, answers);
  }

  function handleSkip() {
    if (submitted) return;
    lockAnswer(null, answers);
  }

  const q = questions[index];
  const progress = questions.length ? ((index) / questions.length) * 100 : 0;
  const timerPct = (timeLeft / TIMER_SECS) * 100;
  const timerColor =
    timeLeft > 15 ? "#0FA98A" : timeLeft > 8 ? "#F59E0B" : "#EF4444";

  return (
    <PageShell>
      <Breadcrumb
        trail={[
          { label: "Home", to: "/" },
          { label: "Dashboard", to: "/dashboard" },
          { label: "HR MCQ Quiz" },
        ]}
      />

      <AnimatePresence mode="wait">
        {/* ── INTRO ─────────────────────────────────────────────────────── */}
        {stage === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-coral-soft text-coral flex items-center justify-center mb-6 shadow-soft">
              <Users size={28} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-2">
              HR Round — MCQ
            </h1>
            <p className="text-sm sm:text-base text-ink-soft mb-8 leading-relaxed">
              10 situational & behavioral questions. You have{" "}
              <span className="font-semibold text-ink">30 seconds</span> per question.
              The next question loads automatically when the timer ends.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Questions", value: "10" },
                { label: "Time / Q", value: "30s" },
                { label: "Topics", value: "8+" },
              ].map((s) => (
                <div key={s.label} className="card p-4 text-center">
                  <p className="font-display font-bold text-2xl text-coral">{s.value}</p>
                  <p className="text-xs text-ink-soft mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <button onClick={start} disabled={loading} className="btn-primary bg-coral hover:bg-coral">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} />}
              Start HR MCQ Round
            </button>
          </motion.div>
        )}

        {/* ── QUIZ ──────────────────────────────────────────────────────── */}
        {stage === "quiz" && q && (
          <motion.div
            key={`quiz-${index}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="max-w-2xl w-full"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-ink-faint">
                Question {index + 1} / {questions.length}
              </span>
              {/* Circular timer */}
              <div className="relative w-12 h-12">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#E8ECF4" strokeWidth="4" />
                  <circle
                    cx="24" cy="24" r="20" fill="none"
                    stroke={timerColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - timerPct / 100)}`}
                    style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s" }}
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                  style={{ color: timerColor }}
                >
                  {timeLeft}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-border rounded-full mb-6 overflow-hidden">
              <motion.div
                className="h-full bg-coral rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Question card */}
            <div className="card p-6 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full bg-${categoryColor(q.category)}-soft text-${categoryColor(q.category)}`}
                >
                  {q.category}
                </span>
              </div>
              <p className="font-semibold text-ink text-base sm:text-lg leading-snug">
                {q.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-5">
              {q.options.map((opt, oi) => {
                let cls =
                  "w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-sm font-medium ";
                if (!submitted) {
                  cls +=
                    selected === oi
                      ? "border-coral bg-coral-soft text-ink shadow-soft"
                      : "border-border text-ink-soft hover:border-coral/50 hover:bg-coral-soft/40 hover:text-ink";
                } else {
                  // show right/wrong after lock
                  if (oi === selected && selected !== null) {
                    cls += "border-coral bg-coral-soft text-ink";
                  } else {
                    cls += "border-border text-ink-faint opacity-60";
                  }
                }

                return (
                  <motion.button
                    key={oi}
                    whileHover={!submitted ? { scale: 1.01 } : {}}
                    whileTap={!submitted ? { scale: 0.99 } : {}}
                    onClick={() => handleSelect(oi)}
                    disabled={submitted}
                    className={cls}
                  >
                    <span className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-bold text-ink-soft shrink-0">
                      {OPTION_LABELS[oi]}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Skip button */}
            {!submitted && (
              <button
                onClick={handleSkip}
                className="btn-secondary text-xs px-4 py-2 gap-1.5"
              >
                <SkipForward size={14} /> Skip
              </button>
            )}

            {/* Submitted feedback overlay */}
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs text-ink-soft"
              >
                <ChevronRight size={14} className="animate-pulse text-coral" />
                Loading next question…
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── RESULT ────────────────────────────────────────────────────── */}
        {stage === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full"
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-20">
                <Loader2 size={32} className="animate-spin text-coral" />
                <p className="text-sm text-ink-soft">Scoring your answers…</p>
              </div>
            ) : result ? (
              <>
                {/* Score hero */}
                <div className="card p-8 text-center mb-6 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-coral/5 to-transparent pointer-events-none"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <div className="w-16 h-16 rounded-full bg-coral-soft text-coral flex items-center justify-center mx-auto mb-4">
                    <Trophy size={28} />
                  </div>
                  <p className="font-display text-5xl font-bold text-coral">{result.score}%</p>
                  <p className="text-ink-soft mt-2 text-sm">
                    {result.correctCount} of {result.total} correct
                  </p>
                  <p className="text-xs text-ink-faint mt-1">
                    {result.score >= 80
                      ? "🎉 Excellent performance!"
                      : result.score >= 60
                      ? "👍 Good effort — keep practicing!"
                      : "📚 Review the explanations and try again."}
                  </p>
                </div>

                {/* Category breakdown */}
                {Object.keys(result.byCategory || {}).length > 0 && (
                  <div className="card p-5 mb-6">
                    <p className="text-xs font-semibold text-ink-faint uppercase tracking-widest mb-4">
                      By Category
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(result.byCategory).map(([cat, v]) => {
                        const pct = Math.round((v.correct / Math.max(v.total, 1)) * 100);
                        const cc = categoryColor(cat);
                        return (
                          <div key={cat} className={`rounded-xl p-3 bg-${cc}-soft`}>
                            <p className={`text-xs font-semibold text-${cc} truncate`}>{cat}</p>
                            <p className="font-display font-bold text-ink mt-1">
                              {v.correct}/{v.total}
                            </p>
                            <div className="h-1.5 bg-surface/60 rounded-full mt-2 overflow-hidden">
                              <div
                                className={`h-full bg-${cc} rounded-full transition-all duration-700`}
                                style={{ width: `${pct}%` }}
                              />
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
                    {result.breakdown.map((b, i) => {
                      const origQ = questions[i];
                      if (!origQ) return null;
                      return (
                        <div key={b.id} className="border border-border rounded-xl p-4">
                          <div className="flex items-start gap-2 mb-2">
                            {b.correct ? (
                              <CheckCircle2 size={16} className="text-mint shrink-0 mt-0.5" />
                            ) : (
                              <XCircle size={16} className="text-coral shrink-0 mt-0.5" />
                            )}
                            <p className="text-sm font-medium text-ink">{origQ.question}</p>
                          </div>
                          <div className="ml-6 space-y-1">
                            {origQ.options.map((opt, oi) => {
                              const isCorrect = oi === b.correctAnswer;
                              const wasChosen = oi === b.selected;
                              return (
                                <p
                                  key={oi}
                                  className={`text-xs rounded-lg px-2 py-1 ${
                                    isCorrect
                                      ? "bg-mint-soft text-mint font-semibold"
                                      : wasChosen && !isCorrect
                                      ? "bg-coral-soft text-coral line-through"
                                      : "text-ink-faint"
                                  }`}
                                >
                                  {OPTION_LABELS[oi]}. {opt}
                                </p>
                              );
                            })}
                            {b.explanation && (
                              <p className="text-xs text-ink-soft mt-2 italic">{b.explanation}</p>
                            )}
                            {b.skipped && (
                              <p className="text-xs text-amber font-medium mt-1">⏰ Time expired — skipped</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button onClick={() => setStage("intro")} className="btn-secondary">
                  <RotateCcw size={16} /> Try again
                </button>
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
