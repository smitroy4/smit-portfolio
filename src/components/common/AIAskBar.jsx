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
You are Smit AI — Smit Roy's portfolio assistant.

You have TWO sources of knowledge:
1. The supplied knowledge below (portfolio projects, tech notes, learning resources)
2. Your own training data (general knowledge)

RULES:
- For questions about Smit Roy's portfolio, projects, or technical content → answer using the supplied knowledge FIRST. Prioritize accuracy over completeness.
- For general questions about finance, sports, geopolitics, history, science, or any other topic → use your own training. Answer freely and accurately.
- NEVER invent project details. If the supplied knowledge doesn't cover a portfolio-specific question, say so.
- Use markdown with headings and bullet points when useful.
- Keep answers concise, clear, and technically accurate.

Supplied Knowledge:

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
          dark:border-zinc-700
          dark:bg-zinc-800
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
            dark:from-zinc-800/50
            dark:via-zinc-800
            dark:to-zinc-800/50
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
              dark:bg-blue-900/50
              px-4
              py-2
              mb-5
            "
          >
            <Sparkles
              size={16}
              className="text-blue-600 dark:text-blue-400"
            />

            <span
              className="
                text-sm
                font-medium
                text-blue-700 dark:text-blue-300
              "
            >
              AI Assistant — Ask Me Anything
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
              dark:text-zinc-400
              max-w-3xl
              mb-8
            "
          >
            Ask about distributed systems,
            AI, cybersecurity, data science,
            or Smit&apos;s projects — I&apos;ll
            answer all your queries!
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
              placeholder="Ask about anything — distributed systems, AI, cybersecurity, data science..."
              className="
                flex-1
                h-14
                rounded-2xl
                border
                border-zinc-200
                dark:border-zinc-600
                dark:bg-zinc-700
                dark:text-zinc-200
                px-5
                outline-none
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-100
                dark:focus:ring-blue-900/50
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
              "Explain CircuitMart microservices architecture",
              "How does StayGrid dynamic pricing work?",
              "What is the CAP theorem in distributed systems?",
              "Explain transformers in AI/ML",
              "What are common types of cyber attacks?",
              "Difference between supervised and unsupervised learning",
              "How does load balancing work in distributed systems?",
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
                  dark:bg-zinc-700
                  dark:text-zinc-300
                  text-sm
                  hover:bg-zinc-200
                  dark:hover:bg-zinc-600
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
                dark:border-zinc-700
                bg-zinc-50
                dark:bg-zinc-800/50
                p-6
              "
            >
              <div
                className="
                  text-sm
                  font-semibold
                  text-zinc-500
                  dark:text-zinc-400
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