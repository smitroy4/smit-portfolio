import { useState } from "react";

import {
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

import ReactMarkdown from "react-markdown";

import { GoogleGenerativeAI } from "@google/generative-ai";

import aiKnowledge from "../../data/aiKnowledge";

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

  function getRelevantContext(
    question
  ) {
    const q =
      question.toLowerCase();

    for (const [key, value] of Object.entries(
      aiKnowledge
    )) {
      if (
        q.includes(
          key.toLowerCase()
        )
      ) {
        return value;
      }
    }

    return Object.values(
      aiKnowledge
    ).join("\n\n");
  }

  async function handleAsk() {
    if (!question.trim()) return;

    try {
      setLoading(true);
      setAnswer("");

      const model =
        genAI.getGenerativeModel({
          model:
            "gemini-3.1-flash-lite",
        });

      const relevantContext =
        getRelevantContext(
          question
        );

      const prompt = `
You are Smit AI.

You are an assistant for Smit Roy's portfolio.

Answer ONLY from the supplied knowledge.

If the answer cannot be found in the supplied knowledge, reply:

"I couldn't find that information in the available project, blog, or resource documentation."

Knowledge Base:

${relevantContext}

User Question:

${question}

Instructions:

- Use markdown.
- Use headings.
- Use bullet points when useful.
- Be concise.
- Never invent implementation details.
- Never make assumptions.
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
            projects, blogs,
            architecture decisions,
            implementation details,
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
              placeholder="How does StayGrid dynamic pricing work?"
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
              "How is JWT Spring Boot Starter implemented?",
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