import { motion } from "framer-motion";

const floatingBadges = [
  "Java",
  "PostgreSQL",
  "Spring Boot",
  "Microservices",
  "Docker & K8s",
  "System Design",
];

function AboutHero() {
  return (
    <section className="relative mb-24 overflow-hidden">
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
        {/* Left Content */}
        <div>
          {/* Badge */}
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
              Building Systems That Scale
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="
              text-4xl
              md:text-5xl
              lg:text-6xl
              font-black
              tracking-tight
              leading-[0.95]
              mb-8
            "
          >
            Thinking in Systems.
            <br />

            <span
              className="
                bg-gradient-to-r
                from-blue-600
                to-cyan-500
                bg-clip-text
                text-transparent
              "
            >
              Building Software
            </span>

            <br />

            That Scales.
          </motion.h1>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="
              space-y-6
              text-lg
              text-zinc-600
              leading-relaxed
              max-w-2xl
            "
          >
            <p>
              I'm Smit Roy an MCA student and a Backend Developer focused on
              Java, Spring Boot, Microservices, System Design, and scalable
              software engineering.
            </p>

            <p>
              My journey into technology started from a finance background and
              gradually evolved into software development through self-learning,
              practical projects, and continuous improvement.
            </p>

            <p>
              Today I spend most of my time learning backend development,
              distributed systems, databases, cloud-native development, and
              modern software architecture.
            </p>

            <p>
              My long-term goal is to become a highly skilled Java Backend
              Developer capable of designing reliable, scalable, and
              production-ready applications.
            </p>
          </motion.div>
        </div>

        {/* Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="
            flex
            justify-center
            lg:justify-end
            mt-10
            lg:mt-0
          "
        >
          <div className="relative">
            {/* Profile Image */}
            <motion.img
              src="/images/profile/smit-roy.webp"
              alt="Smit Roy"
              whileHover={{
                scale: 1.03,
              }}
              transition={{
                duration: 0.4,
              }}
              className="
                w-72
                h-72
                sm:w-80
                sm:h-80
                lg:w-96
                lg:h-96
                object-contain
                rounded-[32px]
                shadow-2xl
              "
            />

            {/* Floating Badges - Desktop Only */}
            <div className="hidden lg:block">
              {floatingBadges.map((badge, index) => (
                <motion.div
                  key={badge}
                  animate={{
                    y: [0, -10, 0],
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
                    px-4
                    py-2
                    shadow-lg
                    text-sm
                    font-medium
                  "
                  style={{
                    top: `${10 + index * 75}px`,
                    left: `${-240 + (index % 2) * 60}px`,
                  }}
                >
                  {badge}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default AboutHero;