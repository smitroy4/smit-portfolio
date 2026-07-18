import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Loader2, X, Coffee, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GoogleGenerativeAI } from "@google/generative-ai";

import aiKnowledge from "../../data/aiKnowledge";
import generalKnowledge from "../../data/generalKnowledge";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);

function AIFloatingButton() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  function getRelevantContext(question) {
    const q = question.toLowerCase();
    const matches = [];

    for (const [key, value] of Object.entries(aiKnowledge)) {
      if (q.includes(key.toLowerCase())) {
        matches.push(value);
      }
    }

    for (const [key, value] of Object.entries(generalKnowledge)) {
      const normalizedKey = key.replace(/_/g, " ").toLowerCase();
      if (q.includes(normalizedKey) || normalizedKey.split(" ").some((word) => q.includes(word))) {
        matches.push(value);
      }
    }

    if (matches.length > 0) {
      return matches.join("\n\n");
    }

    return `
=== PORTFOLIO KNOWLEDGE ===

${Object.values(aiKnowledge).join("\n\n")}

=== TECHNICAL KNOWLEDGE ===

${Object.values(generalKnowledge).join("\n\n")}
`;
  }

  async function handleAsk() {
    if (!question.trim()) return;

    try {
      setLoading(true);
      setAnswer("");

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const relevantContext = getRelevantContext(question);

      const prompt = `
You are Hack4j AI — Smit Roy's portfolio assistant. You are confident, direct, and dive deep into every question.

You have TWO sources of knowledge:
1. The supplied knowledge below (portfolio projects, tech notes, learning resources)
2. Your own training data (general knowledge)

RULES:
- For questions about Smit Roy's portfolio, projects, or technical content → answer using the supplied knowledge FIRST. Prioritize accuracy over completeness.
- For general questions about finance, sports, geopolitics, history, science, or any other topic → use your own training. Answer freely and accurately. Never say you're limited — dive deep and give a thorough answer.
- NEVER invent project details. If the supplied knowledge doesn't cover a portfolio-specific question, say so.
- Use markdown with headings and bullet points when useful.
- Keep answers concise, clear, and technically accurate.
- Start your answer directly with substance — no disclaimers about being an AI or about the scope of your knowledge. Just answer the question.

Supplied Knowledge:

${relevantContext}

User Question:

${question}
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      setAnswer(response);
    } catch (error) {
      console.error(error);
      setAnswer(error.message || "Something went wrong while contacting Gemini.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((p) => !p)}
        initial={false}
        whileHover={{
          y: -6,
          scale: 1.08,
          boxShadow: "0 20px 60px rgba(139,92,246,0.3)",
          transition: { type: "spring", stiffness: 400, damping: 10 },
        }}
        whileTap={{ scale: 0.9, y: 4 }}
        className="
          group
          fixed
          bottom-6
          left-6
          z-50
          h-14
          w-14
          rounded-full
          bg-zinc-900
          text-white
          shadow-[0_10px_30px_rgba(0,0,0,0.25)]
          flex
          items-center
          justify-center
          cursor-pointer
          overflow-visible
        "
      >
        <motion.div
          animate={
            open
              ? { rotate: 90, scale: 0.8 }
              : { rotate: 0, scale: 1 }
          }
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          {open ? (
            <X size={24} strokeWidth={2.5} />
          ) : (
            <span className="relative flex items-center justify-center">
              {/* Coffee cup with steam/sparkles */}
              <Coffee
                size={24}
                strokeWidth={2.5}
                className="transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
              />
              {/* Sparkles/steam rising from coffee */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-1 right-0"
              >
                <Sparkles size={14} strokeWidth={2} className="text-amber-400" />
              </motion.div>
            </span>
          )}
        </motion.div>
      </motion.button>

      {/* Chat overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="
                fixed
                top-1/2
                left-1/2
                -translate-x-1/2
                -translate-y-1/2
                z-50
                w-[calc(100vw-3rem)]
                max-w-4xl
                max-h-[85vh]
                flex
                flex-col
                rounded-2xl
                border
                border-zinc-200
                dark:border-zinc-700
                bg-white
                dark:bg-zinc-800
                shadow-2xl
                overflow-hidden
              "
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <Coffee size={18} className="text-amber-500" />
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Hack4j AI
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {answer && (
                    <button
                      onClick={handleCopy}
                      className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      title="Copy answer"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                  >
                    <X size={16} className="text-zinc-500" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {!answer && !loading && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mt-8">
                   Ask about distributed systems,
            AI, cybersecurity, data science,
            or Smit&apos;s projects — I&apos;ll
            answer all your queries!
                  </p>
                )}

                {loading && (
                  <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <Loader2 size={14} className="animate-spin" />
                    Thinking...
                  </div>
                )}

                {answer && (
                  <div className="text-[16px] text-zinc-700 dark:text-zinc-300 leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1 [&_code]:bg-zinc-100 [&_code]:dark:bg-zinc-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_pre]:bg-zinc-100 [&_pre]:dark:bg-zinc-700 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:dark:bg-transparent [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-300 [&_blockquote]:dark:border-zinc-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-500 [&_blockquote]:dark:text-zinc-400 [&_a]:text-purple-600 [&_a]:dark:text-purple-400 [&_a]:underline">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <table className="w-full" style={{ borderCollapse: "collapse" }}>
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-zinc-100 dark:bg-zinc-700/50">{children}</thead>
                        ),
                        tbody: ({ children }) => (
                          <tbody>{children}</tbody>
                        ),
                        th: ({ children }) => (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-700">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                            {children}
                          </td>
                        ),
                        tr: ({ children }) => (
                          <tr>{children}</tr>
                        ),
                      }}
                    >
                      {answer}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-zinc-200 dark:border-zinc-700 p-4">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                    placeholder="Ask anything..."
                    className="
                      flex-1
                      h-11
                      rounded-xl
                      border
                      border-zinc-200
                      dark:border-zinc-600
                      dark:bg-zinc-700
                      dark:text-zinc-200
                      px-4
                      text-sm
                      outline-none
                      focus:border-purple-400
                      focus:ring-4
                      focus:ring-purple-100
                      dark:focus:ring-purple-900/40
                    "
                  />
                  <button
                    onClick={handleAsk}
                    disabled={loading}
                    className="
                      h-11
                      w-11
                      rounded-xl
                      bg-purple-600
                      text-white
                      flex
                      items-center
                      justify-center
                      hover:bg-purple-700
                      transition
                      disabled:opacity-50
                    "
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default AIFloatingButton;
