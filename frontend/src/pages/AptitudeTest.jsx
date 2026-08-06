import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, RotateCcw, Loader2 } from "lucide-react";
import PageShell from "../components/PageShell.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import api from "../api.js";

export default function AptitudeTest() {
  const [stage, setStage] = useState("intro");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function start() {
    setLoading(true);
    const { data } = await api.get("/aptitude/questions", { params: { count: 8 } });
    setQuestions(data.questions);
    setAnswers({});
    setResult(null);
    setStage("test");
    setLoading(false);
  }

  async function submit() {
    setLoading(true);
    const payload = Object.entries(answers).map(([id, selected]) => ({ id, selected }));
    const { data } = await api.post("/aptitude/submit", { answers: payload });
    await api.post("/progress/update", { module: "aptitudeTest", score: data.score });
    setResult(data);
    setStage("result");
    setLoading(false);
  }

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  useEffect(() => {
    if (stage === "intro") return;
  }, [stage]);

  return (
    <PageShell>
      <Breadcrumb trail={[{ label: "Home", to: "/" }, { label: "Dashboard", to: "/dashboard" }, { label: "Aptitude Test" }]} />

      <AnimatePresence mode="wait">
        {stage === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl">
            <div className="w-14 h-14 rounded-full bg-amber-soft text-amber flex items-center justify-center mb-5">
              <BrainCircuit size={24} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-2">Aptitude Test</h1>
            <p className="text-sm sm:text-base text-ink-soft mb-6 sm:mb-8">
              8 quick questions across quantitative, logical, and verbal reasoning. No time pressure — take your time.
            </p>
            <button onClick={start} disabled={loading} className="btn-primary bg-amber hover:bg-amber">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
              Start test
            </button>
          </motion.div>
        )}

        {stage === "test" && (
          <motion.div key="test" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl space-y-6">
            {questions.map((q, qi) => (
              <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.04 }} className="card p-6">
                <span className="text-xs font-semibold text-amber uppercase tracking-wide">{q.category}</span>
                <p className="font-medium text-ink mt-1 mb-4">
                  {qi + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className={`w-full text-left text-sm px-4 py-2.5 rounded-xl border transition-colors ${
                        answers[q.id] === oi
                          ? "bg-amber-soft border-amber text-ink font-medium"
                          : "border-border text-ink-soft hover:bg-paper"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
            <button onClick={submit} disabled={!allAnswered || loading} className="btn-primary disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Submit test"}
            </button>
          </motion.div>
        )}

        {stage === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="card p-8 text-center mb-6">
              <p className="font-display text-4xl font-bold text-amber">{result.score}%</p>
              <p className="text-ink-soft mt-2">
                {result.correctCount} of {result.total} correct
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {Object.entries(result.byCategory || {}).map(([cat, v]) => (
                <div key={cat} className="card p-4 text-center">
                  <p className="text-xs text-ink-soft mb-1">{cat}</p>
                  <p className="font-display font-bold text-ink">
                    {v.correct}/{v.total}
                  </p>
                </div>
              ))}
            </div>
            <button onClick={() => setStage("intro")} className="btn-secondary mt-6">
              <RotateCcw size={16} /> Retake test
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
