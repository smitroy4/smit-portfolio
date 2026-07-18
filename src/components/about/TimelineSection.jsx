import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Database, ArrowRightLeft, Users, Globe, Server, GraduationCap, Coffee, Code2, Sprout, Rocket, Target, GitFork, Network, Cog } from "lucide-react";
import timeline from "../../data/timeline";

const STORY_DURATION = 6000;

const storyIcons = [
  Database,
  ArrowRightLeft,
  Users,
  Globe,
  Server,
  GraduationCap,
  Coffee,
  Code2,
  Sprout,
  Rocket,
  Target,
  GitFork,
  Network,
  Cog,
];

function TimelineSection() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [viewed, setViewed] = useState(new Set());

  const isOpen = activeIndex !== null;
  const pausedRef = useRef(false);
  const progressRef = useRef(0);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const closeStory = useCallback(() => {
    setActiveIndex(null);
    setProgress(0);
    progressRef.current = 0;
  }, []);

  const goNext = useCallback(() => {
    if (activeIndex < timeline.length - 1) {
      setViewed((prev) => new Set(prev).add(activeIndex));
      setActiveIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      setViewed((prev) => new Set(prev).add(activeIndex));
      closeStory();
    }
  }, [activeIndex, closeStory]);

  const goPrev = useCallback(() => {
    if (activeIndex > 0) {
      setProgress(0);
      setActiveIndex((prev) => prev - 1);
    }
  }, [activeIndex]);

  const openStory = useCallback((index) => {
    setActiveIndex(index);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    progressRef.current = 0;
    setProgress(0);
    lastTickRef.current = Date.now();

    const interval = setInterval(() => {
      if (pausedRef.current) {
        lastTickRef.current = Date.now();
        return;
      }

      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      progressRef.current += elapsed / STORY_DURATION;

      if (progressRef.current >= 1) {
        setProgress(1);
        clearInterval(interval);
        goNext();
      } else {
        setProgress(progressRef.current);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen, activeIndex, goNext]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeStory();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, closeStory, goNext, goPrev]);

  const currentItem = isOpen ? timeline[activeIndex] : null;

  return (
    <section className="mb-20">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl font-bold mb-10"
      >
        Journey Timeline
      </motion.h2>

      <div className="flex flex-wrap gap-5">
        {timeline.map((item, index) => {
          const isViewed = viewed.has(index);
          const isActive = activeIndex === index;

          return (
            <motion.button
              key={`${item.year}-${item.title}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04, type: "spring", stiffness: 200 }}
              onClick={() => openStory(index)}
              className={`
                group flex-1 min-w-[260px] max-w-full sm:max-w-[calc(50%-10px)] lg:max-w-[calc(33.333%-14px)] text-left
                rounded-2xl border p-5
                transition-all duration-300 cursor-pointer
                ${isViewed || (isOpen && index <= activeIndex)
                  ? "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80"
                  : "border-blue-200/60 dark:border-blue-500/30 bg-white dark:bg-zinc-800/80 shadow-sm"
                }
                hover:shadow-lg hover:-translate-y-0.5
              `}
            >
              <div
                className={`
                  w-12 h-1 rounded-full mb-4 transition-colors duration-300
                  ${isViewed || (isOpen && index <= activeIndex)
                    ? "bg-zinc-300 dark:bg-zinc-600"
                    : "bg-gradient-to-r from-blue-500 to-cyan-400"
                  }
                `}
              />

              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {item.year}
              </span>

              <h3 className="font-bold text-base mt-1.5 mb-2 text-zinc-800 dark:text-zinc-100 line-clamp-1">
                {item.title}
              </h3>

              <p className="text-xs italic text-zinc-400 dark:text-zinc-500 mb-2 line-clamp-1">
                {item.tagline}
              </p>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                {item.description}
              </p>

              <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                View story
                <ChevronRight size={14} />
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {isOpen && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            onClick={closeStory}
          >
            <motion.div
              key={activeIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-cyan-600 to-teal-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/30" />

              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5" />

              <div className="relative z-10 flex gap-1.5 pt-4 px-6">
                {timeline.map((_, i) => (
                  <div key={i} className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                      style={{
                        width:
                          i < activeIndex
                            ? "100%"
                            : i === activeIndex
                              ? `${progress * 100}%`
                              : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={closeStory}
                className="absolute top-5 right-5 z-20 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors text-white"
              >
                <X size={18} />
              </button>

              <div className="absolute top-5 left-6 z-20 text-xs font-medium text-white/60">
                {activeIndex + 1} / {timeline.length}
              </div>

              {activeIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors text-white"
                >
                  <ChevronLeft size={22} />
                </button>
              )}
              {activeIndex < timeline.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors text-white"
                >
                  <ChevronRight size={22} />
                </button>
              )}

              <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-10 py-20 min-h-[420px]">
                <motion.div
                  key={`icon-${activeIndex}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05, duration: 0.4, type: "spring" }}
                  className="mb-5"
                >
                  {(() => {
                    const Icon = storyIcons[activeIndex] || Cog;
                    return <Icon size={40} className="text-white/80" strokeWidth={1.5} />;
                  })()}
                </motion.div>

                <motion.span
                  key={`year-${activeIndex}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="text-sm font-medium text-white/60 tracking-[0.2em] uppercase mb-3"
                >
                  {currentItem.year}
                </motion.span>

                <motion.h3
                  key={`title-${activeIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-2xl md:text-3xl font-bold mb-3 leading-tight"
                >
                  {currentItem.title}
                </motion.h3>

                <motion.p
                  key={`tagline-${activeIndex}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-white/50 text-sm italic mb-6 max-w-sm"
                >
                  {currentItem.tagline}
                </motion.p>

                <motion.p
                  key={`desc-${activeIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="text-white/70 leading-relaxed text-sm md:text-base max-w-sm"
                >
                  {currentItem.description}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default TimelineSection;