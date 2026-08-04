export const quizBank = {
  javascript: [
    {
      id: "js1",
      question: "What is the output of typeof null in JavaScript?",
      options: ["'null'", "'undefined'", "'object'", "'boolean'"],
      answer: 2,
      explanation: "typeof null returns 'object' — a long-standing JS quirk.",
    },
    {
      id: "js2",
      question: "Which method creates a new array without mutating the original?",
      options: ["push()", "splice()", "map()", "sort()"],
      answer: 2,
      explanation: "map() returns a new array; push/splice/sort mutate in place.",
    },
    {
      id: "js3",
      question: "What does the '===' operator check?",
      options: [
        "Value only",
        "Value and type",
        "Reference only",
        "Type only",
      ],
      answer: 1,
      explanation: "Strict equality checks both value and type, no coercion.",
    },
    {
      id: "js4",
      question: "What is a closure?",
      options: [
        "A function bundled with its lexical scope",
        "A loop that never ends",
        "A CSS layout technique",
        "A way to close a database connection",
      ],
      answer: 0,
      explanation: "A closure lets a function remember variables from where it was defined.",
    },
    {
      id: "js5",
      question: "Which keyword declares a block-scoped variable?",
      options: ["var", "let", "function", "global"],
      answer: 1,
      explanation: "let (and const) are block-scoped; var is function-scoped.",
    },
  ],
  react: [
    {
      id: "r1",
      question: "What hook is used to manage local state in a function component?",
      options: ["useEffect", "useState", "useRef", "useMemo"],
      answer: 1,
      explanation: "useState returns a state value and setter for function components.",
    },
    {
      id: "r2",
      question: "What is the virtual DOM?",
      options: [
        "A browser API",
        "An in-memory representation of the real DOM for efficient diffing",
        "A database",
        "A CSS framework",
      ],
      answer: 1,
      explanation: "React diffs the virtual DOM to minimize real DOM updates.",
    },
    {
      id: "r3",
      question: "When does useEffect with an empty dependency array run?",
      options: [
        "On every render",
        "Never",
        "Once, after the initial render",
        "Only on unmount",
      ],
      answer: 2,
      explanation: "An empty array means the effect runs once after mount.",
    },
    {
      id: "r4",
      question: "How do you pass data from a parent to a child component?",
      options: ["State", "Props", "Context only", "Refs only"],
      answer: 1,
      explanation: "Props are the standard way to pass data down the tree.",
    },
    {
      id: "r5",
      question: "What does React.memo do?",
      options: [
        "Memoizes a component to skip re-renders when props are unchanged",
        "Stores data in localStorage",
        "Creates a global store",
        "Handles routing",
      ],
      answer: 0,
      explanation: "React.memo prevents re-render if props are shallow-equal.",
    },
  ],
  sql: [
    {
      id: "s1",
      question: "Which SQL clause filters rows before grouping?",
      options: ["HAVING", "WHERE", "GROUP BY", "ORDER BY"],
      answer: 1,
      explanation: "WHERE filters rows before aggregation; HAVING filters after.",
    },
    {
      id: "s2",
      question: "Which join returns only matching rows from both tables?",
      options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"],
      answer: 2,
      explanation: "INNER JOIN returns rows with matches in both tables.",
    },
    {
      id: "s3",
      question: "What does a PRIMARY KEY enforce?",
      options: [
        "Uniqueness and non-null values",
        "Sorted storage",
        "Faster inserts only",
        "Encryption",
      ],
      answer: 0,
      explanation: "A primary key uniquely identifies each row and cannot be null.",
    },
  ],
};

export function getQuizSet(topic = "javascript", count = 5) {
  const pool = quizBank[topic] || quizBank.javascript;
  return pool.slice(0, count);
}
