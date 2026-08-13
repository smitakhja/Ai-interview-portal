import { Router } from "express";
import multer from "multer";
import { analyzeResumeText } from "../utils/analyzer.js";
import { createWorker } from "tesseract.js";
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
  console.warn("OpenAI API key not configured or invalid for Resume Analyzer.");
}
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

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
        const pageText = content.items.map((item) => item.str).join(" ");
        fullText += " " + pageText;
      }
      if (fullText.trim().length > text.trim().length) {
        text = fullText;
      }
    } catch (pdfjsErr) {
      console.error("pdfjs extraction error:", pdfjsErr);
    }
  }

  return text;
}

// POST /api/resume/analyze (multipart/form-data, field name: "resume")
// Accepts PDF, TXT, or Image files (PNG, JPG, WEBP), or raw text JSON.
router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    let text = req.body?.text || "";
    let filePreviewUrl = null;
    let fileType = "text";

    if (req.file) {
      const mimetype = req.file.mimetype || "";
      const filename = req.file.originalname.toLowerCase();
      const isPdf = mimetype === "application/pdf" || filename.endsWith(".pdf");
      const isImage = mimetype.startsWith("image/") || /\.(png|jpg|jpeg|webp|bmp)$/i.test(filename);

      if (isImage) {
        fileType = "image";
        filePreviewUrl = `data:${mimetype || "image/png"};base64,${req.file.buffer.toString("base64")}`;
        try {
          const worker = await createWorker("eng");
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
        error:
          "Unable to extract readable text (min 15 characters) from this file. Please upload a readable text resume (PDF or TXT) or an image/photo of your resume (PNG, JPG, or WEBP).",
      });
    }

    const result = analyzeResumeText(text);
    const extractedSnippet = text.trim().slice(0, 400) + (text.trim().length > 400 ? "..." : "");

    let improvedText = null;
    if (openai && text.trim().length >= 15) {
      try {
        const prompt = `You are an expert ATS resume reviewer and career coach. 
The user has uploaded their resume text (or a part of it). 
Review the following text, and provide a short, improved, rewritten version of it that sounds more professional, uses strong action verbs, and is ATS-friendly. 
Keep it concise. If the text is completely garbled or unreadable (like random characters from bad OCR), politely inform the user that the text couldn't be read properly and ask them for a clearer image or PDF.
Original Text: "${extractedSnippet}"`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: prompt }]
        });
        improvedText = response.choices[0].message.content;
      } catch (aiErr) {
        console.error("OpenAI resume improvement failed:", aiErr);
      }
    }

    res.json({
      success: true,
      fileType,
      filePreviewUrl,
      extractedSnippet,
      improvedText,
      ...result,
    });
  } catch (err) {
    console.error("Resume analysis server error:", err);
    res.status(500).json({ error: "Failed to analyze document. Please try again with a valid PDF, TXT, or image file." });
  }
});

export default router;
