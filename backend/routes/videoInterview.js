import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

let genAI;
let model;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
} catch (e) {
  console.warn("Gemini API key not configured or invalid.");
}

// POST /api/video-interview/start-chat
// Initializes the interview context and generates the first question
router.post("/start-chat", async (req, res) => {
  const { role = "Data Analyst", topic = "General" } = req.body;
  
  if (!model) {
    return res.json({
      success: true,
      message: { role: "assistant", content: `Hello! Welcome to your AI interview for the ${role} position. Tell me about yourself.` },
      history: [
        { role: "system", content: "You are a professional HR and Technical interviewer." },
        { role: "assistant", content: `Hello! Welcome to your AI interview for the ${role} position. Tell me about yourself.` }
      ]
    });
  }

  try {
    const systemPrompt = `You are a Senior AI Interviewer named Nova. You are interviewing a candidate for a ${role} position.
Your goal is to conduct a professional, realistic interview. 
Keep your questions concise, just like a real conversation.
Start the interview by introducing yourself, welcoming the candidate, and asking them to introduce themselves.`;

    const history = [{ role: "system", content: systemPrompt }];
    
    const chatPrompt = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\\n") + "\\nASSISTANT: ";
    const response = await model.generateContent(chatPrompt);

    const aiMessage = { role: "assistant", content: response.response.text() };
    history.push(aiMessage);

    res.json({ success: true, message: aiMessage, history });
  } catch (error) {
    console.error("Gemini start error:", error);
    res.status(500).json({ error: "Failed to start interview." });
  }
});

// POST /api/video-interview/process-chat
// Receives the user's transcript and the chat history. Grades the answer and generates the next follow-up question.
router.post("/process-chat", async (req, res) => {
  const { transcript, history, isFinal = false } = req.body;

  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: "Conversation history is required." });
  }

  // 1. Grade the user's latest answer
  let score = 0;
  let feedback = "Good answer.";
  
  if (model && transcript) {
    try {
      const gradingPrompt = `
        You are an expert interviewer. Grade the candidate's latest answer.
        Latest Answer: "${transcript}"
        
        Analyze the answer and provide:
        1. A score from 1-100 based on technical accuracy, communication, confidence, grammar, and vocabulary.
        2. Constructive feedback in 2-3 sentences indicating strengths and weaknesses.
        
        Return ONLY a JSON object with keys: "score" (number) and "feedback" (string).
      `;
      
      const gradeRes = await model.generateContent(gradingPrompt);
      const textResponse = gradeRes.response.text();
      // Try to parse JSON from the response text
      const jsonMatch = textResponse.match(/\\{.*\\}/s);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        score = analysis.score || 0;
        feedback = analysis.feedback || "";
      }
    } catch (e) {
      console.error("Grading failed:", e);
    }
  }

  // Add user's answer to the conversation history
  const updatedHistory = [...history, { role: "user", content: transcript || "No answer provided." }];

  if (isFinal) {
    // If the interview is over, we just return the score for the final answer and no new question.
    return res.json({ success: true, score, feedback, history: updatedHistory });
  }

  // 2. Generate the next follow-up question
  if (!model) {
    const fallbackMessage = { role: "assistant", content: "Interesting. Can you elaborate on that?" };
    updatedHistory.push(fallbackMessage);
    return res.json({ success: true, message: fallbackMessage, history: updatedHistory, score, feedback });
  }

  try {
    const generationHistory = [...updatedHistory, { 
      role: "system", 
      content: "Acknowledge the user's previous answer briefly if necessary, and then ask ONE follow-up question. Do not repeat previous questions. Be concise and conversational." 
    }];

    const chatPrompt = generationHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\\n") + "\\nASSISTANT: ";
    const response = await model.generateContent(chatPrompt);

    const aiMessage = { role: "assistant", content: response.response.text() };
    updatedHistory.push(aiMessage);

    res.json({ success: true, message: aiMessage, history: updatedHistory, score, feedback });
  } catch (error) {
    console.error("Gemini follow-up error:", error);
    res.status(500).json({ error: "Failed to generate follow-up." });
  }
});

export default router;
