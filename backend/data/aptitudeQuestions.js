export const aptitudeBank = [
  {
    id: "a1",
    category: "Quantitative",
    question: "A train travels 360 km in 4 hours. What is its speed?",
    options: ["80 km/h", "90 km/h", "75 km/h", "100 km/h"],
    answer: 1,
  },
  {
    id: "a2",
    category: "Quantitative",
    question: "If 20% of a number is 50, what is the number?",
    options: ["200", "250", "150", "300"],
    answer: 1,
  },
  {
    id: "a3",
    category: "Logical",
    question: "Find the next number: 2, 6, 12, 20, 30, ?",
    options: ["36", "40", "42", "44"],
    answer: 2,
  },
  {
    id: "a4",
    category: "Logical",
    question: "All roses are flowers. Some flowers fade quickly. Which conclusion is valid?",
    options: [
      "All roses fade quickly",
      "Some roses fade quickly",
      "No valid conclusion follows",
      "No roses fade quickly",
    ],
    answer: 2,
  },
  {
    id: "a5",
    category: "Verbal",
    question: "Choose the word closest in meaning to 'Meticulous'.",
    options: ["Careless", "Careful", "Quick", "Loud"],
    answer: 1,
  },
  {
    id: "a6",
    category: "Verbal",
    question: "Choose the correct antonym of 'Abundant'.",
    options: ["Plentiful", "Scarce", "Huge", "Rich"],
    answer: 1,
  },
  {
    id: "a7",
    category: "Quantitative",
    question: "What is the compound interest on ₹1000 at 10% for 2 years?",
    options: ["₹200", "₹210", "₹220", "₹100"],
    answer: 1,
  },
  {
    id: "a8",
    category: "Logical",
    question: "Pointing to a photo, Ravi said, 'She is the daughter of my grandfather's only son.' Who is she to Ravi?",
    options: ["Sister", "Cousin", "Mother", "Aunt"],
    answer: 0,
  },
];

export function getAptitudeSet(count = 8) {
  return aptitudeBank.slice(0, count);
}
