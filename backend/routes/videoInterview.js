import { Router } from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// Safely initialize OpenAI only if the key exists to prevent crashing if it's not set yet
let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (e) {
  console.warn("OpenAI API key not configured or invalid.");
}

// POST /api/video-interview/generate-questions
router.post("/generate-questions", async (req, res) => {
  const { role = "Software Engineer", experience = "Entry Level", count = 5 } = req.body;
  
  if (!openai) {
    // Fallback if OpenAI isn't configured yet
    return res.json({
      success: true,
      questions: [
        { question: `Tell me about yourself and why you applied for the ${role} position.` },
        { question: "What is your greatest technical strength?" },
        { question: "Can you describe a challenging project you worked on?" },
        { question: "How do you handle disagreements within a team?" },
        { question: "Where do you see yourself in 5 years?" }
      ].slice(0, count)
    });
  }

  try {
    const prompt = `Generate ${count} interview questions for a ${experience} ${role}. Return ONLY a JSON object with a key "questions" containing an array of objects. Each object must have a key "question" (string).`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for speed and cost-effectiveness in interviews
      messages: [{ role: "system", content: "You are an expert technical interviewer." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = JSON.parse(response.choices[0].message.content);
    const questions = content.questions || [];

    res.json({ success: true, questions });
  } catch (error) {
    console.error("OpenAI generation error:", error);
    res.status(500).json({ error: "Failed to generate questions using AI." });
  }
});

// POST /api/video-interview/analyze-answer
router.post("/analyze-answer", async (req, res) => {
  const { question, transcript } = req.body;

  if (!question || !transcript) {
    return res.status(400).json({ error: "Question and transcript are required." });
  }

  if (!openai) {
    // Basic fallback analyzer if no API key
    const wordCount = transcript.split(" ").length;
    let score = Math.min(100, wordCount * 2);
    let feedback = score > 60 ? "Good answer, quite detailed." : "Try to provide more detail.";
    return res.json({ success: true, score, feedback });
  }

  try {
    const prompt = `
      You are an expert technical interviewer grading a candidate's verbal response to an interview question.
      
      Question: "${question}"
      Candidate's Answer Transcript: "${transcript}"
      
      Analyze the answer and provide:
      1. A score from 1-100 based on technical accuracy, communication, and confidence.
      2. Constructive feedback in 2-3 sentences.
      
      Return ONLY a JSON object with keys: "score" (number) and "feedback" (string).
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: "You are an expert technical interviewer." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    res.json({ success: true, ...analysis });
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    res.status(500).json({ error: "Failed to analyze answer using AI." });
  }
});

export default router;
