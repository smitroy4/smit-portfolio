import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { GoogleGenerativeAI } from "@google/generative-ai";

import aiKnowledge from "../../data/aiKnowledge";
import generalKnowledge from "../../data/generalKnowledge";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);

function AIAskBar() {
  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  function getRelevantContext(question) {
    const q = question.toLowerCase();

    const matches = [];

    // Search portfolio/project knowledge
    for (const [key, value] of Object.entries(
      aiKnowledge
    )) {
      if (
        q.includes(
          key.toLowerCase()
        )
      ) {
        matches.push(value);
      }
    }

    // Search technical knowledge
    for (const [key, value] of Object.entries(
      generalKnowledge
    )) {
      const normalizedKey = key
        .replace(/_/g, " ")
        .toLowerCase();

      if (
        q.includes(normalizedKey) ||
        normalizedKey
          .split(" ")
          .some((word) =>
            q.includes(word)
          )
      ) {
        matches.push(value);
      }
    }

    if (matches.length > 0) {
      return matches.join("\n\n");
    }

    return `
=== PORTFOLIO KNOWLEDGE ===

${Object.values(aiKnowledge).join(
  "\n\n"
)}

=== TECHNICAL KNOWLEDGE ===

${Object.values(
  generalKnowledge
).join("\n\n")}
`;
  }

  async function handleAsk() {
    if (!question.trim()) return;

    try {
      setLoading(true);
      setAnswer("");

      const model =
        genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
        });

      const relevantContext =
        getRelevantContext(
          question
        );

      const prompt = `
You are Smit AI.

You represent Smit Roy's portfolio,
projects, technical articles,
engineering notes, and learning resources.

Rules:

- Answer ONLY using the supplied knowledge.
- Do not hallucinate.
- Do not invent project details.
- Do not assume facts not present in the knowledge.
- If information is unavailable, reply exactly:

"I couldn't find that information in the available knowledge base."

- Use markdown.
- Use headings.
- Use bullet points when useful.
- Keep answers concise but technically accurate.

Knowledge:

${relevantContext}

User Question:

${question}
`;

      const result =
        await model.generateContent(
          prompt
        );

      const response =
        result.response.text();

      setAnswer(response);
    } catch (error) {
      console.error(error);

      setAnswer(
        error.message ||
          "Something went wrong while contacting Gemini."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-16">
      <div
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-zinc-200
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-blue-50
            via-white
            to-cyan-50
          "
        />

        <div className="relative p-8">
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-blue-50
              px-4
              py-2
              mb-5
            "
          >
            <Sparkles
              size={16}
              className="text-blue-600"
            />

            <span
              className="
                text-sm
                font-medium
                text-blue-700
              "
            >
              AI Project & Resource
              Explainer
            </span>
          </div>

          <h2
            className="
              text-3xl
              font-bold
              mb-3
            "
          >
            Ask Anything
          </h2>

          <p
            className="
              text-zinc-600
              max-w-3xl
              mb-8
            "
          >
            Ask questions about
            projects, architecture,
            Spring Boot, Java,
            microservices, databases,
            DSA, design patterns,
            resources, and more.
          </p>

          <div className="flex gap-3">
            <input
              value={question}
              onChange={(e) =>
                setQuestion(
                  e.target.value
                )
              }
              onKeyDown={(e) =>
                e.key === "Enter" &&
                handleAsk()
              }
              placeholder="Ask about Java, Spring Boot, StayGrid, CircuitMart, JWT..."
              className="
                flex-1
                h-14
                rounded-2xl
                border
                border-zinc-200
                px-5
                outline-none
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-100
              "
            />

            <button
              onClick={handleAsk}
              disabled={loading}
              className="
                h-14
                px-6
                rounded-2xl
                bg-black
                text-white
                font-medium
                flex
                items-center
                gap-2
              "
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Thinking...
                </>
              ) : (
                <>
                  Ask
                  <ArrowRight
                    size={16}
                  />
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {[
              "How does StayGrid dynamic pricing work?",
              "Explain CircuitMart architecture",
              "What is optimistic vs pessimistic locking?",
              "Difference between HashMap and ConcurrentHashMap",
              "Explain Java virtual threads",
              "Which design patterns are used in StayGrid?",
            ].map((item) => (
              <button
                key={item}
                onClick={() =>
                  setQuestion(item)
                }
                className="
                  px-4
                  py-2
                  rounded-full
                  bg-zinc-100
                  text-sm
                  hover:bg-zinc-200
                  transition
                "
              >
                {item}
              </button>
            ))}
          </div>

          {answer && (
            <div
              className="
                mt-8
                rounded-2xl
                border
                border-zinc-200
                bg-zinc-50
                p-6
              "
            >
              <div
                className="
                  text-sm
                  font-semibold
                  text-zinc-500
                  mb-4
                "
              >
                AI Response
              </div>

              <div
                className="
                  prose
                  prose-zinc
                  max-w-none
                "
              >
                <ReactMarkdown>
                  {answer}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AIAskBar;