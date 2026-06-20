import { motion } from "framer-motion";

import PageWrapper from "../components/common/PageWrapper";
import ProjectCard from "../components/cards/ProjectCard";
import SEO from "../components/common/SEO";

import projects from "../data/projects";
import CTA from "../components/home/CTA";

function Projects() {
  return (
    <>
      <SEO
        title="Projects"
        description="Backend systems, open-source libraries, and production-oriented Java Spring Boot projects built by Smit Roy."
      />

      <PageWrapper>

        {/* Hero */}
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

          <div className="relative">

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
                Engineering Through Projects
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
              Backend Systems &
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
                Open Source
              </span>

              <br />

              Work
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="
                text-lg
                md:text-xl
                text-zinc-600
                leading-relaxed
                max-w-3xl
                mb-12
              "
            >
              A collection of backend systems, open-source
              libraries, and production-oriented projects
              focused on scalability, security, distributed
              systems, and modern software architecture.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="
                grid
                grid-cols-2
                md:grid-cols-4
                gap-5
                max-w-4xl
              "
            >
              <div
                className="
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                <h3 className="text-3xl font-bold">
                  {projects.length}+
                </h3>

                <p className="text-zinc-500 text-sm mt-1">
                  Projects
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                <h3 className="text-3xl font-bold">
                  Java
                </h3>

                <p className="text-zinc-500 text-sm mt-1">
                  Core Stack
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                <h3 className="text-3xl font-bold">
                  API
                </h3>

                <p className="text-zinc-500 text-sm mt-1">
                  First Design
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                <h3 className="text-3xl font-bold">
                  OSS
                </h3>

                <p className="text-zinc-500 text-sm mt-1">
                  Libraries
                </p>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </div>
        <CTA />

      </PageWrapper>
    </>
  );
}

export default Projects;