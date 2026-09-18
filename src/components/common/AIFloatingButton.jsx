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
              <div className="relative bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 px-5 py-4">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:18px_18px] opacity-40 pointer-events-none" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white/20 text-white">
                      <Coffee size={20} />
                    </span>
                    <div>
                      <div className="text-base font-bold text-white leading-tight">
                        Hack4j AI
                      </div>
                      <div className="text-xs text-white/80">
                        Ask me anything about Smit&apos;s work and beyond...
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {answer && (
                      <button
                        onClick={handleCopy}
                        className="p-2 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors"
                        title="Copy answer"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    )}
                    <button
                      onClick={() => setOpen(false)}
                      className="
                        h-9
                        w-9
                        rounded-full
                        bg-zinc-800
                        text-white
                        flex
                        items-center
                        justify-center
                        hover:bg-zinc-900
                        hover:rotate-90
                        transition-all
                        duration-300
                        cursor-pointer
                      "
                      title="Close"
                      aria-label="Close"
                    >
                        <X size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {!answer && !loading && (
                  <div className="flex flex-col items-center justify-center text-center min-h-[280px] px-2">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900/40 dark:to-cyan-900/40 text-purple-500 dark:text-purple-300 mb-5">
                      <Sparkles size={26} />
                    </div>

                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 max-w-sm">
                      Ask about distributed systems, AI, cybersecurity, data
                      science, or Smit&apos;s projects — I&apos;ll answer all
                      your queries!
                    </p>

                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">
                      Pick a suggestion or type your own question below.
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center mt-6 w-full">
                      {[
                        "What is EclatAI and how does it work?",
                        "Explain CircuitMart microservices architecture",
                        "How does StayGrid dynamic pricing work?",
                        "What is the CAP theorem in distributed systems?",
                        "Difference between supervised and unsupervised learning",
                      ].map((item) => (
                        <button
                          key={item}
                          onClick={() => setQuestion(item)}
                          className="
                            px-3.5
                            py-1.5
                            rounded-full
                            border
                            border-zinc-200
                            dark:border-zinc-600
                            bg-zinc-100
                            dark:bg-zinc-700
                            dark:text-zinc-300
                            text-xs
                            font-medium
                            hover:border-purple-300
                            dark:hover:border-purple-500
                            hover:text-purple-600
                            dark:hover:text-purple-300
                            transition
                          "
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                    <Loader2 size={18} className="animate-spin text-purple-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                        Thinking...
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        Hack4j AI is crafting an answer
                      </span>
                    </div>
                  </div>
                )}

                {answer && (
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        AI Response
                      </span>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                        title="Copy answer"
                      >
                        {copied ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                    </div>

                    <div className="text-[15px] text-zinc-700 dark:text-zinc-300 leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1 [&_code]:bg-zinc-100 [&_code]:dark:bg-zinc-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_pre]:bg-zinc-100 [&_pre]:dark:bg-zinc-700 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:dark:bg-transparent [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-300 [&_blockquote]:dark:border-zinc-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-500 [&_blockquote]:dark:text-zinc-400 [&_a]:text-purple-600 [&_a]:dark:text-purple-400 [&_a]:underline">
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
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-zinc-200 dark:border-zinc-700 p-4 bg-zinc-50/50 dark:bg-zinc-800">
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
                      min-w-11
                      px-3
                      rounded-xl
                      bg-gradient-to-r
                      from-purple-600
                      to-blue-500
                      text-white
                      flex
                      items-center
                      justify-center
                      gap-1.5
                      text-sm
                      font-medium
                      hover:from-purple-500
                      hover:to-blue-400
                      transition
                      disabled:opacity-50
                    "
                  >
                    <span className="hidden sm:inline">Ask</span>
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
