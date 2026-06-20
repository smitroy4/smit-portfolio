import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const question = req.body?.question;

  if (!question) {
    return res.status(400).json({
      error: "Question is required",
    });
  }

  try {
    const aiDir = path.join(
      process.cwd(),
      "src",
      "ai"
    );

    const files = fs
      .readdirSync(aiDir)
      .filter((file) => file.endsWith(".md"));

    let context = "";

    for (const file of files) {
      context += fs.readFileSync(
        path.join(aiDir, file),
        "utf8"
      );

      context += "\n\n";
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are Smit AI.

Use ONLY the provided knowledge base.

If information does not exist,
say:

"I couldn't find that information in the available documentation."

Knowledge Base:

${context}

Question:

${question}

Answer clearly and briefly.
`;

    const result =
      await model.generateContent(prompt);

    return res.status(200).json({
      answer: result.response.text(),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}