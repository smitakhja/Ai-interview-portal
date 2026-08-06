import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, CheckCircle2, XCircle, RotateCcw, Loader2 } from "lucide-react";
import PageShell from "../components/PageShell.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import api from "../api.js";

export default function TechnicalQuiz() {
  const [stage, setStage] = useState("select");
  const [topics, setTopics] = useState([]);
  const [topic, setTopic] = useState("javascript");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get("/quiz/topics").then((res) => setTopics(res.data.topics)).catch(() => setTopics(["javascript", "react", "sql"]));
  }, []);

  async function start() {
    setLoading(true);
    const { data } = await api.get("/quiz/questions", { params: { topic, count: 5 } });
    setQuestions(data.questions);
    setAnswers({});
    setResult(null);
    setStage("quiz");
    setLoading(false);
  }

  async function submit() {
    setLoading(true);
    const payload = Object.entries(answers).map(([id, selected]) => ({ id, selected }));
    const { data } = await api.post("/quiz/submit", { topic, answers: payload });
    await api.post("/progress/update", { module: "technicalQuiz", score: data.score });
    setResult(data);
    setStage("result");
    setLoading(false);
  }

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  return (
    <PageShell>
      <Breadcrumb trail={[{ label: "Home", to: "/" }, { label: "Dashboard", to: "/dashboard" }, { label: "Technical Quiz" }]} />

      <AnimatePresence mode="wait">
        {stage === "select" && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-2">Technical Quiz</h1>
            <p className="text-sm sm:text-base text-ink-soft mb-6 sm:mb-8">Pick a topic to test your fundamentals.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl">
              {(topics.length ? topics : ["javascript", "react", "sql"]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`card p-5 text-left capitalize transition-all ${
                    topic === t ? "ring-2 ring-mint shadow-card -translate-y-0.5" : "hover:-translate-y-0.5 hover:shadow-card"
                  }`}
                >
                  <Code2 size={20} className="text-mint mb-2" />
                  <p className="font-semibold text-sm text-ink">{t}</p>
                </button>
              ))}
            </div>
            <button onClick={start} disabled={loading} className="btn-primary mt-8 bg-mint hover:bg-mint">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Code2 size={18} />}
              Start quiz
            </button>
          </motion.div>
        )}

        {stage === "quiz" && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl space-y-6">
            {questions.map((q, qi) => (
              <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.05 }} className="card p-6">
                <p className="font-medium text-ink mb-4">
                  {qi + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className={`w-full text-left text-sm px-4 py-2.5 rounded-xl border transition-colors ${
                        answers[q.id] === oi
                          ? "bg-mint-soft border-mint text-ink font-medium"
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
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Submit quiz"}
            </button>
          </motion.div>
        )}

        {stage === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="card p-8 text-center mb-6">
              <p className="font-display text-4xl font-bold text-mint">{result.score}%</p>
              <p className="text-ink-soft mt-2">
                {result.correctCount} of {result.total} correct
              </p>
            </div>
            <div className="space-y-3">
              {result.breakdown.map((b) => (
                <div key={b.id} className="card p-4 flex items-start gap-3">
                  {b.correct ? <CheckCircle2 className="text-mint shrink-0" size={18} /> : <XCircle className="text-coral shrink-0" size={18} />}
                  <p className="text-sm text-ink-soft">{b.explanation}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setStage("select")} className="btn-secondary mt-6">
              <RotateCcw size={16} /> Try another topic
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
