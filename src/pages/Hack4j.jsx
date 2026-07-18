import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Coffee,
  Brain,
  Cloud,
  Cpu,
  Network,
  Rocket,
  Sparkles,
  Globe,
  Gauge,
} from "lucide-react";
import { Link } from "react-router-dom";

import PageWrapper from "../components/common/PageWrapper";
import SEO from "../components/common/SEO";

const float = {
  initial: { y: 0 },
  animate: (i) => ({
    y: [0, -12, 0],
    transition: {
      duration: 3 + i * 0.5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: i * 0.3,
    },
  }),
};

const glowPulse = {
  initial: { opacity: 0.4, scale: 1 },
  animate: {
    opacity: [0.4, 0.8, 0.4],
    scale: [1, 1.05, 1],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

const steamPath =
  "M0,10 C5,0 15,0 20,10 C25,20 35,20 40,10 C45,0 55,0 60,10";

const steamVariants = {
  animate: (i) => ({
    pathLength: [0, 1, 0],
    opacity: [0, 0.6, 0],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: i * 0.6,
    },
  }),
};

function Hack4j() {
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = 2036;
    if (count < target) {
      const timer = setTimeout(
        () => setCount((c) => Math.min(c + Math.ceil((target - c) / 20), target)),
        30,
      );
      return () => clearTimeout(timer);
    }
  }, [count]);

  useEffect(() => {
    const target = 42;
    if (progress < target) {
      const timer = setTimeout(
        () => setProgress((c) => Math.min(c + Math.ceil((target - c) / 8), target)),
        60,
      );
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <>
      <SEO
        title="Hack4j — The Future of Engineering"
        description="A learning community exploring Java, Spring Boot, React, DevOps, Cloud, AI-integrated systems, advanced system design, and how real systems scale — 10 years ahead."
      />

      <PageWrapper>
        <div className="relative min-h-[80vh] overflow-hidden">
          {/* Animated background orbs */}
          <motion.div
            variants={glowPulse}
            initial="initial"
            animate="animate"
            className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl pointer-events-none"
          />
          <motion.div
            variants={glowPulse}
            initial="initial"
            animate="animate"
            style={{ animationDelay: "2s" }}
            className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl pointer-events-none"
          />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-cyan-500/5 dark:bg-cyan-500/3 blur-3xl pointer-events-none" />

          {/* Floating decorative shapes */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={float}
              initial="initial"
              animate="animate"
              className="absolute hidden md:block pointer-events-none"
              style={{
                left: `${15 + i * 14}%`,
                top: `${10 + (i % 3) * 30}%`,
              }}
            >
              {i % 3 === 0 ? (
                <div className="w-2 h-2 rounded-full bg-purple-400/30 dark:bg-purple-400/20" />
              ) : i % 3 === 1 ? (
                <div className="w-2.5 h-2.5 rounded bg-blue-400/30 dark:bg-blue-400/20 rotate-45" />
              ) : (
                <Sparkles size={14} className="text-amber-400/30 dark:text-amber-400/20" />
              )}
            </motion.div>
          ))}

          <div className="relative flex flex-col items-center justify-center text-center pt-16 pb-24">
            {/* Coming Soon Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="
                inline-flex
                items-center
                gap-3
                rounded-full
                border
                border-purple-200
                bg-purple-50
                dark:border-purple-900/50
                dark:bg-purple-900/30
                px-5
                py-2
                mb-8
              "
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
              </span>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Coming Soon
              </span>
            </motion.div>

            {/* Animated Coffee + Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, type: "spring", stiffness: 120 }}
              className="relative mb-6"
            >
              <div className="relative inline-block">
                <Coffee
                  size={64}
                  className="text-blue-500 dark:text-blue-400 mb-2 relative"
                />
                {/* Steam lines */}
                <svg
                  viewBox="0 0 60 20"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <motion.path
                    d={steamPath}
                    custom={0}
                    variants={steamVariants}
                    initial="animate"
                    className="text-blue-400/60 dark:text-blue-300/60"
                  />
                  <motion.path
                    d={steamPath}
                    custom={1}
                    variants={steamVariants}
                    initial="animate"
                    className="text-purple-400/60 dark:text-purple-300/60"
                    style={{ transform: "translateX(-8px)" }}
                  />
                  <motion.path
                    d={steamPath}
                    custom={2}
                    variants={steamVariants}
                    initial="animate"
                    className="text-cyan-400/60 dark:text-cyan-300/60"
                    style={{ transform: "translateX(8px)" }}
                  />
                </svg>
              </div>

              <h1
                className="
                  text-5xl
                  md:text-7xl
                  lg:text-8xl
                  font-black
                  tracking-tight
                  leading-none
                "
              >
                <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Hack4j
                </span>
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="
                text-lg
                md:text-xl
                text-zinc-600
                dark:text-zinc-400
                leading-relaxed
                max-w-3xl
                mb-10
              "
            >
              A community that lives 10 years ahead. We explore Java, Spring Boot, React,
              DevOps, and Cloud — then push further into AI-integrated systems,
              advanced distributed architecture, and engineering that scales to millions.
            </motion.p>

            {/* Animated Stat Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex items-center gap-8 md:gap-14 mb-16"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Rocket size={20} className="text-purple-500" />
                  <span className="text-3xl md:text-4xl font-black text-zinc-800 dark:text-zinc-100 tabular-nums">
                    {count}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 font-medium">
                  Horizon Year
                </p>
              </div>

              <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-700" />

              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Globe size={20} className="text-blue-500" />
                  <span className="text-3xl md:text-4xl font-black text-zinc-800 dark:text-zinc-100">
                    0
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 font-medium">
                  Pioneers
                </p>
              </div>

              <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-700" />

              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Gauge size={20} className="text-cyan-500" />
                  <span className="text-3xl md:text-4xl font-black text-zinc-800 dark:text-zinc-100">
                    1
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 font-medium">
                  Mission
                </p>
              </div>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="w-full max-w-md mb-20"
            >
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500 mb-2">
                <span>Building the Future</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400 tabular-nums">
                  {progress}%
                </span>
              </div>
              <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: 0.7, duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400"
                />
              </div>
            </motion.div>

            {/* Pillars of Hack4j */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="w-full max-w-5xl mb-20"
            >
              <div className="flex items-center gap-2 mb-8 justify-center">
                <Network size={18} className="text-zinc-400" />
                <h2 className="text-sm font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
                  Our Pillars
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    icon: Brain,
                    title: "AI-Integrated Systems",
                    desc: "Embed intelligence into every layer — from LLM-powered backends to autonomous agents and real-time ML pipelines that learn and adapt.",
                    gradient: "from-purple-600 to-pink-500",
                  },
                  {
                    icon: Network,
                    title: "System Design & Scale",
                    desc: "Architect systems that serve millions. Distributed consensus, event sourcing, CQRS, sharding, and the patterns that power planetary-scale engineering.",
                    gradient: "from-blue-600 to-cyan-500",
                  },
                  {
                    icon: Cloud,
                    title: "Full-Stack Cloud & DevOps",
                    desc: "Java, Spring Boot, React, Kubernetes, Istio, Terraform — full ownership from IDE to production with GitOps, observability, and chaos engineering.",
                    gradient: "from-cyan-500 to-teal-500",
                  },
                  {
                    icon: Cpu,
                    title: "10 Years Ahead",
                    desc: "We don't just learn today's stack. We study where the industry is heading — WebAssembly at the edge, serverless databases, AI-native architectures, and beyond.",
                    gradient: "from-amber-500 to-orange-500",
                  },
                ].map((pillar, idx) => {
                  const Icon = pillar.icon;

                  return (
                    <motion.div
                      key={pillar.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + idx * 0.1, duration: 0.5 }}
                      whileHover={{
                        y: -6,
                        transition: { type: "spring", stiffness: 300 },
                      }}
                      className="
                        group relative
                        rounded-2xl
                        border border-zinc-200 dark:border-zinc-700
                        bg-white dark:bg-zinc-800/50
                        p-6
                        text-left
                        hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-zinc-900/20
                        transition-all duration-300
                        overflow-hidden
                      "
                    >
                      {/* Gradient accent on hover */}
                      <div
                        className="
                          absolute top-0 left-0 right-0 h-0.5
                          bg-gradient-to-r opacity-0 group-hover:opacity-100
                          transition-opacity duration-300
                        "
                        style={{
                          backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                          "--tw-gradient-from": pillar.gradient.split(" ")[0].replace("from-", ""),
                          "--tw-gradient-to": pillar.gradient.split(" ")[1].replace("to-", ""),
                        }}
                      />

                      <div className="inline-flex p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 mb-4">
                        <Icon size={20} />
                      </div>
                      <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100 mb-2">
                        {pillar.title}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {pillar.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="flex flex-col items-center gap-6"
            >
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Want to help shape the future? I'd love to have a word with you.
              </p>

              <Link
                to="/meeting"
                className="
                  inline-flex
                  items-center
                  gap-2.5
                  rounded-xl
                  bg-gradient-to-r
                  from-purple-600
                  to-blue-500
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  hover:from-purple-500
                  hover:to-blue-400
                  hover:-translate-y-0.5
                  transition-all
                  duration-300
                  shadow-lg
                  shadow-purple-500/25
                "
              >
                Join the Volunteer Team
                <Rocket size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

export default Hack4j;
