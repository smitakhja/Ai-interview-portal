import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Loader2, Trophy, RotateCcw } from "lucide-react";
import PageShell from "../components/PageShell.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import api from "../api.js";

const ROLE_LABELS = {
  "software-engineer": "Software Engineer",
  "data-analyst": "Data Analyst",
  "product-manager": "Product Manager",
};

export default function MockInterview() {
  const [stage, setStage] = useState("select"); // select | interview | summary
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState("software-engineer");
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get("/interview/roles").then((res) => setRoles(res.data.roles)).catch(() => setRoles(Object.keys(ROLE_LABELS)));
  }, []);

  async function startInterview() {
    setLoading(true);
    const { data } = await api.get("/interview/questions", { params: { role, count: 5 } });
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
    const { data } = await api.post("/interview/answer", {
      question: q.question,
      keywords: q.keywords,
      answer,
    });
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
      const { data } = await api.post("/interview/finish", { results });
      await api.post("/progress/update", { module: "mockInterview", score: data.averageScore });
      setSummary(data);
      setStage("summary");
    }
  }

  return (
    <PageShell>
      <Breadcrumb trail={[{ label: "Home", to: "/" }, { label: "Dashboard", to: "/dashboard" }, { label: "AI Mock Interview" }]} />

      <AnimatePresence mode="wait">
        {stage === "select" && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h1 className="font-display text-3xl font-bold text-ink mb-2">AI Mock Interview</h1>
            <p className="text-ink-soft mb-8">Choose a target role. You'll get 5 questions, one at a time, with instant feedback.</p>

            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl">
              {(roles.length ? roles : Object.keys(ROLE_LABELS)).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`card p-5 text-left transition-all ${
                    role === r ? "ring-2 ring-primary shadow-card -translate-y-0.5" : "hover:-translate-y-0.5 hover:shadow-card"
                  }`}
                >
                  <Bot size={20} className="text-primary mb-2" />
                  <p className="font-semibold text-sm text-ink">{ROLE_LABELS[r] || r}</p>
                </button>
              ))}
            </div>

            <button onClick={startInterview} disabled={loading} className="btn-primary mt-8">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Bot size={18} />}
              Start interview
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
                <motion.div
                  className="h-full bg-primary"
                  animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="card p-6 flex gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <Bot size={18} />
              </div>
              <p className="font-medium text-ink pt-1.5">{questions[index].question}</p>
            </div>

            {!feedback ? (
              <>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={5}
                  placeholder="Type your answer..."
                  className="w-full card p-4 text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button onClick={submitAnswer} disabled={loading || !answer.trim()} className="btn-primary mt-4 disabled:opacity-50">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                  Submit answer
                </button>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="font-display text-2xl font-bold text-primary">{feedback.score}</div>
                  <span className="text-xs text-ink-soft">/ 100</span>
                </div>
                <p className="text-sm text-ink-soft mb-4">{feedback.feedback}</p>
                <button onClick={next} className="btn-primary">
                  {index + 1 < questions.length ? "Next question" : "See summary"}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {stage === "summary" && summary && (
          <motion.div key="summary" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg card p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-soft text-amber flex items-center justify-center mx-auto mb-4">
              <Trophy size={26} />
            </div>
            <p className="font-display text-4xl font-bold text-ink">{summary.averageScore}%</p>
            <p className="text-ink-soft mt-2">{summary.verdict}</p>
            <button
              onClick={() => setStage("select")}
              className="btn-secondary mt-8 mx-auto"
            >
              <RotateCcw size={16} /> Try another role
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
