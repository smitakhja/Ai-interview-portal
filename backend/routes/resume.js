import { Router } from "express";
import multer from "multer";
import { analyzeResumeText } from "../utils/analyzer.js";
import { createWorker } from "tesseract.js";
import { db } from "../firebaseAdmin.js";
import { nanoid } from "nanoid";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (e) {
  console.warn("OpenAI API key not configured.");
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function getUserId(req) {
  return req.header("x-user-id") || "demo-user";
}

async function extractPdfText(buffer) {
  let text = "";
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    text = parsed.text || "";
  } catch (pdfErr) {
    console.error("pdf-parse extraction error:", pdfErr);
  }

  if (!text || text.trim().length < 20) {
    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.js");
      const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: true }).promise;
      let fullText = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        fullText += " " + content.items.map(item => item.str).join(" ");
      }
      if (fullText.trim().length > text.trim().length) text = fullText;
    } catch (pdfjsErr) {
      console.error("pdfjs extraction error:", pdfjsErr);
    }
  }
  return text;
}

// POST /api/resume/analyze (multipart/form-data, field: "resume")
router.post("/analyze", upload.single("resume"), async (req, res) => {
  const userId = getUserId(req);
  try {
    let text = req.body?.text || "";
    let filePreviewUrl = null;
    let fileType = "text";
    let fileName = req.body?.fileName || "resume";

    if (req.file) {
      const mimetype = req.file.mimetype || "";
      const filename = req.file.originalname.toLowerCase();
      fileName = req.file.originalname;
      const isPdf = mimetype === "application/pdf" || filename.endsWith(".pdf");
      const isImage = mimetype.startsWith("image/") || /\.(png|jpg|jpeg|webp|bmp)$/i.test(filename);

      if (isImage) {
        fileType = "image";
        filePreviewUrl = `data:${mimetype || "image/png"};base64,${req.file.buffer.toString("base64")}`;
        try {
          const worker = await createWorker("eng", 1, {
            cachePath: "/tmp",
          });
          const { data: ocrResult } = await worker.recognize(req.file.buffer);
          await worker.terminate();
          text = ocrResult?.text || "";
        } catch (ocrErr) {
          console.error("Image OCR extraction failed:", ocrErr);
        }
      } else if (isPdf) {
        fileType = "pdf";
        text = await extractPdfText(req.file.buffer);
      } else {
        text = req.file.buffer.toString("utf-8");
      }
    }

    if (!text || text.trim().length < 15) {
      return res.status(400).json({
        error: "Unable to extract readable text from this file. Please upload a readable PDF, TXT, or image of your resume.",
      });
    }

    const result = analyzeResumeText(text);
    const extractedSnippet = text.trim().slice(0, 400) + (text.trim().length > 400 ? "..." : "");

    let improvedText = null;
    if (openai && text.trim().length >= 15) {
      try {
        const prompt = `You are an expert ATS resume reviewer and career coach. 
Review the following resume text and provide a short, improved, rewritten version that sounds more professional, uses strong action verbs, and is ATS-friendly. Keep it concise.
Original Text: "${extractedSnippet}"`;
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: prompt }],
        });
        improvedText = response.choices[0].message.content;
      } catch (aiErr) {
        console.error("OpenAI resume improvement failed:", aiErr);
      }
    }

    // Save analysis to Firestore
    const analysisId = nanoid();
    const analysis = {
      id: analysisId,
      userId,
      fileName,
      fileType,
      score: result.score || 0,
      skills: result.skills || [],
      strengths: result.strengths || [],
      improvements: result.improvements || [],
      extractedSnippet,
      improvedText,
      createdAt: new Date().toISOString(),
    };

    try {
      await db
        .collection("users").doc(userId)
        .collection("resumeAnalyses").doc(analysisId)
        .set(analysis);
    } catch (dbErr) {
      console.error("Firestore resume save error:", dbErr.message);
    }

    res.json({
      success: true,
      fileType,
      filePreviewUrl,
      extractedSnippet,
      improvedText,
      analysisId,
      ...result,
    });
  } catch (err) {
    console.error("Resume analysis server error:", err);
    res.status(500).json({ error: "Failed to analyze document. Please try again." });
  }
});

// GET /api/resume/history
router.get("/history", async (req, res) => {
  const userId = getUserId(req);
  try {
    const snap = await db
      .collection("users").doc(userId)
      .collection("resumeAnalyses")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    return res.json({ success: true, history: snap.docs.map(d => d.data()) });
  } catch (err) {
    console.error("Firestore resume history error:", err.message);
    res.json({ success: true, history: [] });
  }
});

export default router;
