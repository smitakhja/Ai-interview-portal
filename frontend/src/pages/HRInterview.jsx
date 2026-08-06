import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Lightbulb, Send, Loader2, Trophy, RotateCcw } from "lucide-react";
import PageShell from "../components/PageShell.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import api from "../api.js";

export default function HRInterview() {
  const [stage, setStage] = useState("intro");
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]);

  async function start() {
    setLoading(true);
    const { data } = await api.get("/hr/questions", { params: { count: 5 } });
    setQuestions(data.questions);
    setIndex(0);
    setResults([]);
    setFeedback(null);
    setStage("interview");
    setLoading(false);
  }

  async function submitAnswer() {
    if (!answer.trim()) return;
    setLoading(true);
    const q = questions[index];
    const { data } = await api.post("/hr/answer", { question: q.question, keywords: q.keywords, answer });
    setFeedback(data);
    setResults((r) => [...r, data]);
    setLoading(false);
  }

  async function next() {
    setFeedback(null);
    setAnswer("");
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      const avg = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
      await api.post("/progress/update", { module: "hrInterview", score: avg });
      setStage("summary");
    }
  }

  const avgScore = results.length ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;

  return (
    <PageShell>
      <Breadcrumb trail={[{ label: "Home", to: "/" }, { label: "Dashboard", to: "/dashboard" }, { label: "HR Interview" }]} />

      <AnimatePresence mode="wait">
        {stage === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl">
            <div className="w-14 h-14 rounded-full bg-coral-soft text-coral flex items-center justify-center mb-5">
              <Users size={24} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-2">HR Interview</h1>
            <p className="text-sm sm:text-base text-ink-soft mb-6 sm:mb-8">Practice common behavioral questions. Each comes with a tip before you answer.</p>
            <button onClick={start} disabled={loading} className="btn-primary bg-coral hover:bg-coral">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} />}
              Start HR round
            </button>
          </motion.div>
        )}

        {stage === "interview" && questions[index] && (
          <motion.div key="interview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-ink-faint">
                Question {index + 1} of {questions.length}
              </span>
              <div className="h-1.5 w-40 bg-border rounded-full overflow-hidden">
                <motion.div className="h-full bg-coral" animate={{ width: `${((index + 1) / questions.length) * 100}%` }} />
              </div>
            </div>

            <div className="card p-6 mb-4">
              <p className="font-medium text-ink mb-3">{questions[index].question}</p>
              <div className="flex items-start gap-2 bg-amber-soft text-amber-900 text-xs rounded-lg px-3 py-2">
                <Lightbulb size={14} className="shrink-0 mt-0.5 text-amber" />
                <span className="text-ink-soft">{questions[index].tip}</span>
              </div>
            </div>

            {!feedback ? (
              <>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={5}
                  placeholder="Type your answer..."
                  className="w-full card p-4 text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-coral/30"
                />
                <button onClick={submitAnswer} disabled={loading || !answer.trim()} className="btn-primary bg-coral hover:bg-coral mt-4 disabled:opacity-50">
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
                <button onClick={next} className="btn-primary bg-coral hover:bg-coral">
                  {index + 1 < questions.length ? "Next question" : "See summary"}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {stage === "summary" && (
          <motion.div key="summary" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg card p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-coral-soft text-coral flex items-center justify-center mx-auto mb-4">
              <Trophy size={26} />
            </div>
            <p className="font-display text-4xl font-bold text-ink">{avgScore}%</p>
            <p className="text-ink-soft mt-2">Average across {results.length} answers</p>
            <button onClick={() => setStage("intro")} className="btn-secondary mt-8 mx-auto">
              <RotateCcw size={16} /> Practice again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
