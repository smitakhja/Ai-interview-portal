import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import PageShell from "../components/PageShell.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import api from "../api.js";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const localPreviewUrl = file && file.type?.startsWith("image/") ? URL.createObjectURL(file) : null;

  async function analyze() {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      if (!file) {
        setError("Please upload a file (PDF, TXT, PNG, JPG, or WEBP) to analyze.");
        setLoading(false);
        return;
      }
      form.append("resume", file);
      const { data } = await api.post("/resume/analyze", form);
      setResult(data);
      await api.post("/progress/update", { module: "resumeAnalyzer", score: data.score });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong analyzing your file.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <Breadcrumb trail={[{ label: "Home", to: "/" }, { label: "Dashboard", to: "/dashboard" }, { label: "Resume Analyzer" }]} />

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-2">Resume & Photo Analyzer</h1>
          <p className="text-sm sm:text-base text-ink-soft mb-6 sm:mb-8">Upload a PDF, TXT, or image/photo (PNG, JPG, WEBP) to extract text via OCR and analyze key skills.</p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) {
                setFile(f);
              }
            }}
            className="card border-dashed border-2 border-primary/30 p-5 sm:p-8 flex flex-col items-center text-center cursor-pointer hover:border-primary/60 hover:bg-primary-soft/40 transition-colors"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {localPreviewUrl ? (
              <div className="flex flex-col items-center gap-3">
                <img src={localPreviewUrl} alt="Upload preview" className="max-h-36 max-w-full rounded-lg border border-border object-contain shadow-sm" />
                <p className="font-semibold text-ink text-sm flex items-center gap-2">
                  <FileText size={16} /> {file.name}
                </p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-primary-soft text-primary flex items-center justify-center mb-4">
                  <UploadCloud size={24} />
                </div>
                {file ? (
                  <p className="font-semibold text-ink flex items-center gap-2">
                    <FileText size={16} /> {file.name}
                  </p>
                ) : (
                  <>
                    <p className="font-semibold text-ink">Drop your file or photo here, or click to browse</p>
                    <p className="text-xs text-ink-soft mt-1">PDF, TXT, PNG, JPG, WEBP (up to 10MB)</p>
                  </>
                )}
              </>
            )}
          </motion.div>

          <button
            onClick={analyze}
            disabled={loading || !file}
            className="btn-primary mt-6 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? "Extracting & Analyzing..." : "Analyze file / photo"}
          </button>
          {error && <p className="text-sm text-coral mt-3">{error}</p>}
        </div>

        <div>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card p-5 sm:p-8"
              >
                <div className="flex items-center gap-5 mb-6">
                  <ScoreCircle value={result.score} />
                  <div>
                    <p className="font-display text-xl font-bold text-ink">Analysis Score</p>
                    <p className="text-sm text-ink-soft">{result.wordCount} words extracted</p>
                  </div>
                </div>

                {(result.filePreviewUrl || localPreviewUrl) && (
                  <div className="mb-6 p-4 bg-paper rounded-xl border border-border">
                    <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-2">Uploaded Document / Photo</p>
                    <img
                      src={result.filePreviewUrl || localPreviewUrl}
                      alt="Uploaded resume/photo"
                      className="max-h-48 rounded-lg object-contain border border-border bg-white p-1"
                    />
                  </div>
                )}

                {result.extractedSnippet && (
                  <div className="mb-5 p-4 bg-paper rounded-xl border border-border">
                    <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1.5">Extracted Text (OCR)</p>
                    <p className="text-xs font-mono text-ink bg-white p-3 rounded-lg border border-border max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {result.extractedSnippet}
                    </p>
                  </div>
                )}

                <Section title="Skills found" items={result.skillsFound} empty="No recognized skills found." tone="mint" />
                <Section title="Action verbs used" items={result.actionVerbsFound} empty="No strong action verbs found." tone="primary" />

                {result.improvedText && (
                  <div className="mt-6 p-5 bg-primary-soft/30 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-primary" />
                      <p className="text-sm font-semibold text-primary">AI Suggested Rewrite</p>
                    </div>
                    <p className="text-sm text-ink-soft whitespace-pre-wrap leading-relaxed">
                      {result.improvedText}
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <p className="text-sm font-semibold text-ink mb-3">Suggestions to improve</p>
                  <ul className="space-y-2.5">
                    {result.suggestions.map((s, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-start gap-2.5 text-sm text-ink-soft"
                      >
                        <CheckCircle2 size={16} className="text-mint shrink-0 mt-0.5" />
                        {s}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card p-10 flex flex-col items-center text-center text-ink-soft h-full justify-center"
              >
                <FileText size={36} className="text-ink-faint mb-3" />
                <p className="font-medium">Your analysis & extracted content will appear here</p>
                <p className="text-sm mt-1">Upload a PDF, TXT document, or photo/image to get started.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageShell>
  );
}

function ScoreCircle({ value }) {
  const color = value >= 75 ? "text-mint" : value >= 45 ? "text-amber" : "text-coral";
  return (
    <div className={`w-20 h-20 rounded-full border-4 border-current ${color} flex items-center justify-center font-display font-bold text-xl`}>
      {value}
    </div>
  );
}

function Section({ title, items, empty, tone }) {
  const toneClass = { mint: "bg-mint-soft text-mint", primary: "bg-primary-soft text-primary" }[tone];
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold text-ink mb-2">{title}</p>
      {items?.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((s) => (
            <span key={s} className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${toneClass}`}>
              {s}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-faint">{empty}</p>
      )}
    </div>
  );
}
