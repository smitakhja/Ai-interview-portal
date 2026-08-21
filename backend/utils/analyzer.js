// Rule-based analysis engine.
// If ANTHROPIC_API_KEY is set in .env, callClaude() can be used to replace
// these heuristics with genuine AI-generated feedback — see the commented
// example at the bottom of this file.

const SKILL_LIBRARY = [
  "javascript", "typescript", "react", "node", "express", "python", "django",
  "sql", "mongodb", "aws", "docker", "kubernetes", "git", "html", "css",
  "java", "spring", "c++", "machine learning", "data analysis", "communication",
  "leadership", "agile", "rest api", "graphql", "testing", "ci/cd",
];

const ACTION_VERBS = [
  "built", "led", "designed", "improved", "reduced", "increased", "created",
  "launched", "optimized", "managed", "developed", "implemented", "automated",
  "delivered", "shipped",
];

export function analyzeResumeText(text = "") {
  const lower = text.toLowerCase();

  const foundSkills = SKILL_LIBRARY.filter((skill) => lower.includes(skill));
  const foundVerbs = ACTION_VERBS.filter((verb) => lower.includes(verb));
  const hasMetrics = /\d+(%|\+)|\d+\s*(years|yrs|projects|users|clients)/i.test(text);
  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(text);
  const hasPhone = /(\+?\d[\d\s-]{8,})/.test(text);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  let score = 0;
  score += Math.min(foundSkills.length * 4, 40);
  score += Math.min(foundVerbs.length * 5, 25);
  score += hasMetrics ? 15 : 0;
  score += hasEmail && hasPhone ? 10 : 5;
  score += wordCount > 150 && wordCount < 900 ? 10 : 0;
  score = Math.max(0, Math.min(100, score));

  const suggestions = [];
  if (foundSkills.length < 5) {
    suggestions.push("List more relevant technical skills clearly, ideally in a dedicated skills section.");
  }
  if (foundVerbs.length < 3) {
    suggestions.push("Start bullet points with strong action verbs like 'built', 'led', or 'optimized'.");
  }
  if (!hasMetrics) {
    suggestions.push("Add quantifiable results (%, numbers, timeframes) to show measurable impact.");
  }
  if (!hasEmail || !hasPhone) {
    suggestions.push("Make sure your contact details (email and phone) are clearly visible.");
  }
  if (wordCount < 150) {
    suggestions.push("Your resume looks thin — add more detail about projects and responsibilities.");
  }
  if (wordCount > 900) {
    suggestions.push("Your resume is quite long — aim to keep it concise, ideally one to two pages.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Strong resume overall — fine-tune wording per job description for best results.");
  }

  return {
    score,
    wordCount,
    skillsFound: foundSkills,
    actionVerbsFound: foundVerbs,
    hasMetrics,
    hasContactInfo: hasEmail && hasPhone,
    suggestions,
  };
}

export function scoreAnswer(answerText = "", keywords = []) {
  const lower = answerText.toLowerCase();
  const matched = keywords.filter((k) => lower.includes(k.toLowerCase()));
  const wordCount = answerText.trim().split(/\s+/).filter(Boolean).length;

  let score = 0;
  // Keyword match carries 85 points — short, precise answers still score well
  score += Math.min((matched.length / Math.max(keywords.length, 1)) * 85, 85);
  // Bonus 15 points for using concrete connectors (examples, results, reasons)
  score += /\b(for example|specifically|result|because)\b/i.test(answerText) ? 15 : 0;
  score = Math.max(0, Math.min(100, Math.round(score)));

  let feedback;
  if (score >= 80) feedback = "Excellent, specific, and well-structured answer.";
  else if (score >= 60) feedback = "Good answer — add a concrete example or result to strengthen it.";
  else if (score >= 35) feedback = "Decent start, but needs more relevant detail and structure.";
  else feedback = "Try including more relevant keywords and a concrete example or result."

  return { score, matchedKeywords: matched, wordCount, feedback };
}

/* ---------------- Optional real-AI upgrade ----------------
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function callClaude(prompt) {
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });
  return msg.content.map((b) => b.text || "").join("\n");
}
-------------------------------------------------------------- */
