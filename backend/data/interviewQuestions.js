export const interviewQuestions = {
  "software-engineer": [
    {
      id: "se1",
      question: "Explain the difference between an array and a linked list.",
      keywords: ["memory", "contiguous", "pointer", "insertion", "access", "index"],
    },
    {
      id: "se2",
      question: "How would you design a URL shortening service?",
      keywords: ["hash", "database", "scale", "cache", "collision", "redirect"],
    },
    {
      id: "se3",
      question: "What is time complexity and why does it matter?",
      keywords: ["big o", "efficiency", "scalability", "algorithm", "performance"],
    },
    {
      id: "se4",
      question: "Walk me through how you would debug a production issue.",
      keywords: ["logs", "reproduce", "monitor", "isolate", "rollback", "root cause"],
    },
    {
      id: "se5",
      question: "Tell me about a project you're proud of and your specific role in it.",
      keywords: ["result", "impact", "team", "decision", "learned", "challenge"],
    },
  ],
  "data-analyst": [
    {
      id: "da1",
      question: "How do you handle missing data in a dataset?",
      keywords: ["imputation", "drop", "mean", "median", "context", "bias"],
    },
    {
      id: "da2",
      question: "Explain the difference between correlation and causation.",
      keywords: ["relationship", "confound", "experiment", "variable", "causal"],
    },
    {
      id: "da3",
      question: "How would you present a complex finding to a non-technical audience?",
      keywords: ["simplify", "visual", "story", "chart", "summary", "audience"],
    },
  ],
  "product-manager": [
    {
      id: "pm1",
      question: "How do you prioritize a product backlog?",
      keywords: ["impact", "effort", "user", "value", "framework", "stakeholder"],
    },
    {
      id: "pm2",
      question: "Tell me about a time you had to say no to a stakeholder.",
      keywords: ["priority", "communicate", "tradeoff", "data", "align"],
    },
  ],
};

export function getInterviewSet(role = "software-engineer", count = 5) {
  const pool = interviewQuestions[role] || interviewQuestions["software-engineer"];
  return pool.slice(0, count);
}
