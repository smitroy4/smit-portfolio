import { Download } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";

import siteConfig from "../../data/siteConfig";
import Button from "../common/Button";

const floatingTech = [
  "Java",
  "Spring Boot",
  "Microservices",
  "Docker & K8s",
  "RAG & Gen AI",
  "Redis",
];

function Hero() {
  return (
    <section className="relative pt-0 pb-20 md:pt-2 md:pb-28 overflow-hidden">
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
              border-emerald-200
              bg-emerald-50
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
                  bg-emerald-500
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
                  bg-emerald-500
                "
              />
            </span>

            <span className="text-sm font-medium text-emerald-700">
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
              <h3 className="text-4xl font-bold">4+</h3>

              <p className="text-zinc-500 text-sm mt-1">Projects</p>
            </div>

            <div>
              <h3 className="text-4xl font-bold">10+</h3>

              <p className="text-zinc-500 text-sm mt-1">Technologies</p>
            </div>

            <div>
              <h3 className="text-4xl font-bold">2027</h3>

              <p className="text-zinc-500 text-sm mt-1">MCA Journey</p>
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
                backdrop-blur
                p-8
                shadow-xl
              "
            >
              <div className="flex flex-col items-center text-center mb-8">
                <img
                  src="/smit-roy-porfolio-favicon.png"
                  alt="Smit Roy"
                  className="
      w-70
      h-70
      object-contain
      mb-4
    "
                />

                <h3 className="text-2xl font-bold">Smit Roy</h3>

                <p className="text-zinc-500">Java Backend Developer</p>
              </div>
              <div className="space-y-4 text-zinc-600">
                <p></p>
                <p>📍 Kolkata, India</p>
                <p>🎓 MCA (2025 – 2027)</p>
                <p>☕ Java Backend Development</p>
                <p>⚙️ System Design & Architecture</p>
                <p>☁️ Cloud-Native Development</p>
              </div>
            </div>

            {/* Floating Cards */}
            {floatingTech.map((tech, index) => (
              <motion.div
                key={tech}
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 3 + index,
                  repeat: Infinity,
                }}
                className="
                  absolute
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-white
                  px-5
                  py-3
                  shadow-lg
                  font-medium
                "
                style={{
                  top: `${40 + index * 75}px`,
                  left: `${-70 + (index % 2) * 60}px`,
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
