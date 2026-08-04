export const hrQuestions = [
  {
    id: "hr1",
    question: "Tell me about yourself.",
    keywords: ["experience", "skills", "background", "passion", "goal", "role"],
    tip: "Keep it under 90 seconds: present role, key strengths, then why you're here.",
  },
  {
    id: "hr2",
    question: "Why do you want to work with us?",
    keywords: ["company", "mission", "values", "product", "growth", "culture"],
    tip: "Reference something specific about the company, not a generic answer.",
  },
  {
    id: "hr3",
    question: "What is your biggest weakness?",
    keywords: ["improve", "learning", "working on", "growth", "feedback"],
    tip: "Pick a real, minor weakness and show the concrete steps you're taking on it.",
  },
  {
    id: "hr4",
    question: "Describe a challenge you faced at work and how you handled it.",
    keywords: ["problem", "solution", "team", "result", "learned", "action"],
    tip: "Use the STAR method: Situation, Task, Action, Result.",
  },
  {
    id: "hr5",
    question: "Where do you see yourself in five years?",
    keywords: ["growth", "learn", "lead", "career", "goal", "skills"],
    tip: "Tie your ambitions to a realistic path within this company or field.",
  },
  {
    id: "hr6",
    question: "Why should we hire you?",
    keywords: ["value", "skills", "experience", "unique", "results", "fit"],
    tip: "Match 2-3 of your strongest skills directly to the job requirements.",
  },
];

export function getHrSet(count = 5) {
  return hrQuestions.slice(0, count);
}
