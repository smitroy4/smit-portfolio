import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { ArrowLeft, ExternalLink, FileText, Layers, ListChecks, Sparkles } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import PageWrapper from "../components/common/PageWrapper";
import SEO from "../components/common/SEO";

import projects from "../data/projects";

function DocContent({ content }) {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3">
      {lines.map((line, i) =>
        line.startsWith("- ") ? (
          <div key={i} className="flex gap-2">
            <span className="text-[#fbbf24] mt-[2px]">
              •
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {line.slice(2)}
            </p>
          </div>
        ) : (
          <p
            key={i}
            className="text-zinc-600 dark:text-zinc-400 leading-relaxed"
          >
            {line}
          </p>
        )
      )}
    </div>
  );
}

function ProjectDetail() {
  const { id } = useParams();

  const project = projects.find((item) => item.id === id);

  if (!project) {
    return (
      <>
        <SEO title="Project Not Found" />

        <PageWrapper>
          <div className="max-w-2xl mx-auto text-center py-24">
            <h1 className="text-3xl font-bold mb-4">
              Project Not Found
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8">
              The project you're looking for doesn't exist.
            </p>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#fbbf24] text-zinc-900 font-medium hover:bg-amber-400 transition"
            >
              <ArrowLeft size={18} />
              Back to Projects
            </Link>
          </div>
        </PageWrapper>
      </>
    );
  }

  const statusStyles = {
    Completed:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
    Released:
      "bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300",
    "In Development":
      "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
  };

  return (
    <>
      <SEO
        title={project.title}
        description={project.description}
      />

      <PageWrapper>
        <section className="relative mb-16 overflow-hidden">
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
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Link
                to="/projects"
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-zinc-600
                  dark:text-zinc-400
                  hover:text-[#fbbf24]
                  transition-colors
                "
              >
                <ArrowLeft size={16} />
                All Projects
              </Link>
            </motion.div>

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
                border-zinc-200
                bg-white
                dark:border-zinc-700
                dark:bg-zinc-800
                px-4
                py-2
                mb-8
                shadow-sm
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
                    bg-[#fbbf24]
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
                    bg-[#fbbf24]
                  "
                />
              </span>

              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {project.category}
              </span>
            </motion.div>

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
                mb-6
              "
            >
              {project.title}
            </motion.h1>

            <div className="flex flex-wrap gap-3 mb-8">
              <span
                className={`
                  px-3
                  py-1
                  rounded-full
                  text-sm
                  font-medium
                  ${
                    statusStyles[project.status] ||
                    "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                  }
                `}
              >
                {project.status}
              </span>

              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="
                    px-3
                    py-1
                    rounded-full
                    bg-zinc-100
                    dark:bg-zinc-700
                    text-zinc-700
                    dark:text-zinc-300
                    text-sm
                    font-medium
                  "
                >
                  {tech}
                </span>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
              {project.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-3"
            >
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-5
                  py-3
                  rounded-xl
                  border
                  border-zinc-200
                  dark:border-zinc-600
                  dark:text-zinc-300
                  hover:bg-zinc-50
                  dark:hover:bg-zinc-700
                  transition
                "
              >
                <FaGithub size={16} />
                <span className="text-sm font-medium">
                  View Code
                </span>
              </a>

              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-5
                    py-3
                    rounded-xl
                    bg-blue-600
                    text-white
                    hover:bg-blue-700
                    transition
                  "
                >
                  <ExternalLink size={16} />
                  <span className="text-sm font-medium">
                    Live Demo
                  </span>
                </a>
              )}
            </motion.div>
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <img
            src={project.banner}
            alt={project.title}
            className="
              w-full
              rounded-3xl
              object-cover
              max-h-[560px]
              border
              border-zinc-200
              dark:border-zinc-700
            "
          />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2"
          >
            <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
              <Layers size={20} className="text-[#fbbf24]" />
              Overview
            </h2>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-8 shadow-sm">
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                {project.description}
              </p>
            </div>

            <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6 flex items-center gap-2">
              <ListChecks size={20} className="text-[#fbbf24]" />
              Key Highlights
            </h2>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-8 shadow-sm">
              <ul className="space-y-3">
                {project.highlights.map((item) => (
                  <li
                    key={item}
                    className="text-zinc-700 dark:text-zinc-300 flex gap-3 leading-relaxed"
                  >
                    <Sparkles size={16} className="text-[#fbbf24] shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm">
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Technology Stack
              </h3>

              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="
                      px-3
                      py-1
                      rounded-full
                      bg-zinc-100
                      dark:bg-zinc-700
                      text-zinc-700
                      dark:text-zinc-300
                      text-xs
                      font-medium
                    "
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>

        {project.docs?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
              <FileText size={20} className="text-[#fbbf24]" />
              Documentation
            </h2>

            <div className="grid lg:grid-cols-2 gap-6">
              {project.docs.map((doc, idx) => (
                <div
                  key={doc.title}
                  className="
                    rounded-2xl
                    border
                    border-zinc-200
                    dark:border-zinc-700
                    bg-white
                    dark:bg-zinc-800
                    p-8
                    shadow-sm
                  "
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-amber-100
                        text-amber-700
                        dark:bg-amber-400/15
                        dark:text-amber-300
                        text-sm
                        font-bold
                      "
                    >
                      {idx + 1}
                    </span>

                    <h3 className="text-lg font-semibold">
                      {doc.title}
                    </h3>
                  </div>

                  <DocContent content={doc.content} />
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </PageWrapper>
    </>
  );
}

export default ProjectDetail;