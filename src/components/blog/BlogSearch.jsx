import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles } from "lucide-react";

function BlogSearch({ value, onChange }) {
  const inputRef = useRef(null);

  const [shortcutPulse, setShortcutPulse] = useState(false);

  const suggestions = [
    "Java",
    "Spring Boot",
    "Microservices",
    "SQL",
    "Web Development",
    "DevOps & Deployment",
    "System Design",
    "RAG & Gen AI",
    "DSA",
    "Cloud & AWS",
    "CS Fundamentals",
    "Career & Interview Prep",
  ];

  const shortcutLabel =
    typeof navigator !== "undefined" && navigator.platform.includes("Mac")
      ? "⌘ K"
      : "Ctrl K";

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();

        inputRef.current?.focus();
        inputRef.current?.select();

        setShortcutPulse(true);

        setTimeout(() => {
          setShortcutPulse(false);
        }, 600);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-4">
      <motion.div
        animate={
          shortcutPulse
            ? {
                scale: [1, 1.02, 1],
              }
            : {}
        }
        transition={{
          duration: 0.4,
        }}
        className="relative group"
      >
        {/* Glow */}

        <div
          className="
            absolute
            -inset-[1px]
            rounded-3xl
            bg-gradient-to-r
            from-blue-500
            via-cyan-500
            to-indigo-500
            opacity-0
            blur
            transition-opacity
            duration-500
            group-focus-within:opacity-30
          "
        />

        <div
          className="
            relative
            rounded-3xl
            border
            border-zinc-200
            bg-white/90
            backdrop-blur-xl
            shadow-sm
            overflow-hidden
          "
        >
          <Search
            size={20}
            className="
              absolute
              left-5
              top-1/2
              -translate-y-1/2
              text-zinc-400
              group-focus-within:text-blue-600
              transition-colors
              duration-300
              pointer-events-none
            "
          />

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search articles, technologies, concepts..."
            className="
              w-full
              h-16
              bg-transparent
              pl-14
              pr-28
              text-base
              font-medium
              text-zinc-800
              placeholder:text-zinc-400
              outline-none
            "
          />

          {/* Right Side */}

          <div
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              flex
              items-center
              gap-2
            "
          >
            {!value && (
              <div
                className="
                  hidden
                  md:flex
                  items-center
                  gap-1
                  px-2.5
                  py-1
                  rounded-lg
                  bg-zinc-100
                  text-xs
                  text-zinc-500
                  font-medium
                "
              >
                {shortcutLabel}
              </div>
            )}

            <AnimatePresence>
              {value && (
                <motion.button
                  initial={{
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0,
                    opacity: 0,
                  }}
                  onClick={() => onChange("")}
                  className="
                    flex
                    items-center
                    justify-center
                    w-9
                    h-9
                    rounded-full
                    bg-zinc-100
                    text-zinc-500
                    hover:bg-zinc-200
                    hover:text-zinc-700
                    transition-all
                  "
                >
                  <X size={16} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Suggestions */}

      <div className="flex flex-wrap gap-2">
        <div
          className="
            flex
            items-center
            gap-1
            text-xs
            text-zinc-500
            mr-2
          "
        >
          <Sparkles size={12} />
          Popular:
        </div>

        {suggestions.map((item) => (
          <motion.button
            key={item}
            whileHover={{
              y: -2,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={() => onChange(item)}
            className="
              px-3
              py-1.5
              rounded-full
              text-xs
              font-medium
              bg-zinc-100
              hover:bg-blue-50
              hover:text-blue-700
              transition-all
            "
          >
            {item}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default BlogSearch;
