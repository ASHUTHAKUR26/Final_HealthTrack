const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Models to try (newest first)
const MODELS = [
  "gemini-flash-latest",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
];

router.post("/chat", async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "messages array is required",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is missing in .env",
      });
    }

    const prompt = `
${systemPrompt || "You are a helpful wellness assistant."}

${messages
  .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
  .join("\n")}

Assistant:
`;

    let reply = null;
    let lastError = "";

    for (const model of MODELS) {
      try {
        console.log(`🤖 Trying model: ${model}`);

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        reply =
          response.text ||
          response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (reply) {
          console.log(`✅ Success with ${model}`);
          break;
        }
      } catch (err) {
        console.log(`❌ ${model}: ${err.message}`);
        lastError = err.message;
      }
    }

    if (!reply) {
      return res.status(500).json({
        success: false,
        message: lastError || "No supported Gemini model found.",
      });
    }

    return res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Gemini Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;