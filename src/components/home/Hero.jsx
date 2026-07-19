import { useEffect, useState } from "react";
import { Download, MapPin, GraduationCap, Coffee, Settings, Cloud } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";

import siteConfig from "../../data/siteConfig";
import Button from "../common/Button";

const floatingTech = [
  "Java",
  "PostgreSQL",
  "Spring Boot",
  "Microservices",
  "Docker & K8s",
  "RAG & Gen AI",
];

function Hero() {
  const [projects, setProjects] = useState(0);
  const [techs, setTechs] = useState(0);

  useEffect(() => {
    const pTarget = 5;
    const tTarget = 60;
    if (projects < pTarget) {
      const timer = setTimeout(
        () => setProjects((c) => Math.min(c + 1, pTarget)),
        80,
      );
      return () => clearTimeout(timer);
    }
    if (techs < tTarget) {
      const timer = setTimeout(
        () => setTechs((c) => Math.min(c + Math.ceil((tTarget - c) / 8), tTarget)),
        40,
      );
      return () => clearTimeout(timer);
    }
  }, [projects, techs]);
  return (
    <section className="relative pt-0 pb-20 md:pt-2 md:pb-28">
      {/* Grid Background */}
      <div
        className="
          absolute
          inset-0
          opacity-[0.03]
          pointer-events-none
          bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)]
          bg-[size:60px_60px]
        "
      />

      <div className="relative grid lg:grid-cols-2 gap-20 items-center">
        {/* LEFT */}
        <div>
          {/* Availability Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="
              inline-flex
              items-center
              gap-3
              rounded-full
              border
              border-zinc-300
              dark:border-zinc-700
              bg-zinc-100
              dark:bg-zinc-800
              px-4
              py-2
              mb-8
            "
          >
            <span className="relative flex h-3 w-3">
              <span
                className="
                  animate-ping
                  absolute
                  inline-flex
                  h-full
                  w-full
                  rounded-full
                  bg-cyan-500
                  opacity-75
                "
              />

              <span
                className="
                  relative
                  inline-flex
                  rounded-full
                  h-3
                  w-3
                  bg-cyan-500
                "
              />
            </span>

            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Thinking in Systems
            </span>
          </motion.div>

          {/* <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="
              text-blue-600
              font-semibold
              tracking-wide
              uppercase
              mb-5
            "
          >
            
          </motion.p> */}

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="
              text-5xl
              md:text-7xl
              lg:text-7xl
              font-black
              tracking-tight
              leading-none
              mb-8
            "
          >
            Building{" "}
            <span
              className="
                bg-gradient-to-r
                from-blue-600
                to-cyan-500
                bg-clip-text
                text-transparent
              "
            >
              Reliable
            </span>
            <br />&
            <span
              className="
                bg-gradient-to-r
                from-blue-600
                to-cyan-500
                bg-clip-text
                text-transparent
              "
            >
              {" "}
              Scalable
            </span>
            <br />
            Systems
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="
  text-lg
  md:text-xl
  text-zinc-600
  dark:text-zinc-400
  leading-relaxed
  mb-10
  max-w-2xl
"
          >
            Java Backend Developer focused on Spring Boot, Microservices,
            PostgreSQL, Redis, Kafka, System Design, and production-ready
            software.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-14"
          >
            <Button href={siteConfig.resume}>
              <Download size={18} className="mr-2" />
              Resume
            </Button>

            <Button href={siteConfig.github} variant="secondary">
              <FaGithub className="mr-2" />
              GitHub
            </Button>

            <Button href={siteConfig.linkedin} variant="secondary">
              <FaLinkedin className="mr-2" />
              LinkedIn
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="
              grid
              grid-cols-3
              gap-8
              max-w-xl
            "
          >
            <div>
              <h3 className="text-4xl font-black tabular-nums">
                {projects}+
              </h3>

              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Projects</p>
            </div>

            <div>
              <h3 className="text-4xl font-black tabular-nums">
                {techs}+
              </h3>

              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Technologies</p>
            </div>

            <div>
              <h3 className="text-4xl font-black">MCA</h3>

              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Cloud Computing</p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden lg:block"
        >
          <div className="relative h-[550px]">
            {/* Main Card */}
            <div
              className="
                absolute
                right-0
                top-10
                w-[420px]
                rounded-3xl
                border
                border-zinc-200
                bg-white/90
                dark:border-zinc-700
                dark:bg-zinc-800/90
                backdrop-blur
                p-8
                shadow-xl
              "
            >
              <div className="flex flex-col items-center text-center mb-8">
                <img
                  src="/smit-roy-portfolio-favicon.png"
                  alt="Smit Roy"
                  className="
      w-70
      h-70
      object-contain
      mb-4
    "
                />

                <h3 className="text-2xl font-bold">Smit Roy</h3>

                <p className="text-zinc-500 dark:text-zinc-400">Java Backend Developer</p>
              </div>
              <div className="space-y-4 text-zinc-600 dark:text-zinc-300">
                <p className="flex items-center gap-2">
                  <MapPin size={16} className="text-zinc-400 shrink-0" />
                  Kolkata, India
                </p>
                <p className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-zinc-400 shrink-0" />
                  MCA (2025 – 2027)
                </p>
                <p className="flex items-center gap-2">
                  <Coffee size={16} className="text-zinc-400 shrink-0" />
                  Java Backend Development
                </p>
                <p className="flex items-center gap-2">
                  <Settings size={16} className="text-zinc-400 shrink-0" />
                  System Design & Architecture
                </p>
                <p className="flex items-center gap-2">
                  <Cloud size={16} className="text-zinc-400 shrink-0" />
                  Cloud-Native Development
                </p>
              </div>
            </div>

            {/* Floating Cards */}
            {floatingTech.map((tech, index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: [0, -12, 0] }}
                transition={{
                  opacity: { delay: 0.5 + index * 0.08, duration: 0.4 },
                  y: {
                    duration: 3 + index,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.15,
                  },
                }}
                className="
                  absolute
                  rounded-xl
                  border
                  border-zinc-200
                  bg-white
                  dark:border-zinc-700
                  dark:bg-zinc-800
                  dark:text-zinc-200
                  px-3
                  py-1.5
                  shadow-md
                  text-sm
                  font-medium
                "
                style={{
                  top: `${60 + index * 60}px`,
                  left: `${-40 + (index % 2) * 40}px`,
                }}
              >
                {tech}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
