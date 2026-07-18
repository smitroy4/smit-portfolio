import { useMemo, useState } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Search,
  Filter,
  Sparkles,
  X,
  FolderGit2,
  Code2,
  Boxes,
} from "lucide-react";

import PageWrapper from "../components/common/PageWrapper";
import ProjectCard from "../components/cards/ProjectCard";
import SEO from "../components/common/SEO";
import CTA from "../components/home/CTA";

import projects from "../data/projects";

function Projects() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [selectedTech, setSelectedTech] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("latest");

  const categories = [
    "All",
    "Open Source",
    "Backend System",
  ];

  const sortOptions = [
    {
      value: "latest",
      label: "Latest",
    },
    {
      value: "title",
      label: "A-Z",
    },

    {
      value: "completed",
      label: "Completed",
    },
  ];

  const technologies = [
    "All",
    ...new Set(
      projects.flatMap(
        (project) =>
          project.technologies
      )
    ),
  ];

  const filteredProjects =
    useMemo(() => {
      let result = [...projects];

      if (search) {
        result = result.filter(
          (project) =>
            (
              project.title +
              " " +
              project.description +
              " " +
              project.technologies.join(
                " "
              ) +
              " " +
              project.highlights.join(
                " "
              )
            )
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
        );
      }

      if (
        selectedCategory !== "All"
      ) {
        result = result.filter(
          (project) =>
            project.category ===
            selectedCategory
        );
      }

      if (selectedTech !== "All") {
        result = result.filter(
          (project) =>
            project.technologies.includes(
              selectedTech
            )
        );
      }

      switch (sortBy) {
        case "title":
          result.sort((a, b) =>
            a.title.localeCompare(
              b.title
            )
          );
          break;

        case "opensource":
          result.sort(
            (a, b) =>
              (b.category ===
              "Open Source"
                ? 1
                : 0) -
              (a.category ===
              "Open Source"
                ? 1
                : 0)
          );
          break;

        case "completed":
          result.sort(
            (a, b) =>
              (b.status ===
              "Completed"
                ? 1
                : 0) -
              (a.status ===
              "Completed"
                ? 1
                : 0)
          );
          break;

        default:
          break;
      }

      return result;
    }, [
      search,
      selectedCategory,
      selectedTech,
      sortBy,
    ]);

  const featuredProject =
    projects.find(
      (project) =>
        project.featured
    ) || projects[0];

  return (
    <>
      <SEO
        title="Projects"
        description="Backend systems, open-source libraries, and production-oriented Java Spring Boot projects built by Smit Roy."
      />

      <PageWrapper>

        {/* Hero */}

        <section className="relative mb-20 overflow-hidden">

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
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
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
                    bg-blue-500
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
                    bg-blue-500
                  "
                />
              </span>

              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Engineering Through Projects
              </span>

            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
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

            <motion.p
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="
                text-lg
                md:text-xl
                    text-zinc-600 dark:text-zinc-400
                    leading-relaxed
                    max-w-3xl
                    mb-12
              "
            >
              A collection of backend systems,
              open-source libraries, and
              production-oriented projects
              focused on scalability,
              security, distributed systems,
              and modern software
              architecture.
            </motion.p>

            <motion.div
              className="
                grid
                grid-cols-2
                md:grid-cols-4
                gap-5
                max-w-5xl
                mb-12
              "
            >
              {[
                {
                  value:
                    projects.length,
                  label:
                    "Projects",
                  icon:
                    FolderGit2,
                },
                {
                  value:
                    technologies.length -
                    1,
                  label:
                    "Technologies",
                  icon:
                    Code2,
                },
                {
                  value:
                    projects.filter(
                      (p) =>
                        p.category ===
                        "Open Source"
                    ).length,
                  label:
                    "OSS Projects",
                  icon:
                    Boxes,
                },
                {
                  value:
                    "100%",
                  label:
                    "Backend Focus",
                  icon:
                    Code2,
                },
              ].map(
                (
                  item
                ) => {
                  const Icon =
                    item.icon;

                  return (
                    <motion.div
                      key={
                        item.label
                      }
                      whileHover={{
                        y: -5,
                      }}
                      className="
                        rounded-2xl
                        border
                         border-zinc-200 dark:border-zinc-700
                        bg-white dark:bg-zinc-800
                        p-5
                        shadow-sm
                      "
                    >
                      <Icon
                        size={
                          18
                        }
                        className="
                          mb-3
                          text-blue-600
                        "
                      />

                      <h3 className="text-3xl font-bold">
                        {
                          item.value
                        }
                      </h3>

                      <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                        {
                          item.label
                        }
                      </p>
                    </motion.div>
                  );
                }
              )}
            </motion.div>

            {/* Featured Project */}

            {/* <motion.div
              whileHover={{
                y: -4,
              }}
              className="
                rounded-3xl
                border
                border-zinc-200
                bg-gradient-to-br
                from-blue-50
                via-white
                to-cyan-50
                p-8
                shadow-sm
                mb-12
              "
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles
                  size={16}
                  className="text-blue-600"
                />

                <span
                  className="
                    text-blue-600
                    font-semibold
                  "
                >
                  Featured Project
                </span>
              </div>

              <h2
                className="
                  text-3xl
                  md:text-4xl
                  font-bold
                  mb-4
                "
              >
                {
                  featuredProject.title
                }
              </h2>

              <p className="text-zinc-600 max-w-3xl">
                {
                  featuredProject.description
                }
              </p>
            </motion.div> */}


                        {/* Sticky Toolbar */}

            <div
              className="
                sticky
                top-4
                z-30
                rounded-3xl
                border
                border-zinc-200 dark:border-zinc-700
                bg-white/80 dark:bg-zinc-800/80
                backdrop-blur-xl
                p-6
                shadow-sm
                mb-12
              "
            >
              {/* Search */}

              <div className="relative mb-6">
                <Search
                  size={20}
                  className="
                    absolute
                    left-5
                    top-1/2
                    -translate-y-1/2
                    text-zinc-400
                  "
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search projects, Spring Boot, JWT, Kafka, Redis..."
                  className="
                    w-full
                    h-16
                    rounded-2xl
                    border
                    border-zinc-200 dark:border-zinc-700
                    bg-white dark:bg-zinc-800
                    pl-14
                    pr-14
                    outline-none
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-100
                  "
                />

                {search && (
                  <button
                    onClick={() =>
                      setSearch("")
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      w-8
                      h-8
                      rounded-full
                      bg-zinc-100
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Categories */}

              <div className="mb-6">
                <h3
                  className="
                    text-sm
                    font-semibold
                    text-zinc-500 dark:text-zinc-400
                    mb-3
                  "
                >
                  Categories
                </h3>

                <div className="flex flex-wrap gap-2">
                  {categories.map(
                    (category) => (
                      <button
                        key={
                          category
                        }
                        onClick={() =>
                          setSelectedCategory(
                            category
                          )
                        }
                        className={`
                          px-4
                          py-2
                          rounded-xl
                          text-sm
                          font-medium
                          transition-all

                          ${
                            selectedCategory ===
                            category
                              ? "bg-blue-600 text-white shadow-lg"
                              : "bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 hover:border-blue-400"
                          }
                        `}
                      >
                        {category}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Technology Explorer */}

              {/* <div className="mb-6">
                <h3
                  className="
                    text-sm
                    font-semibold
                    text-zinc-500
                    mb-3
                  "
                >
                  Technologies
                </h3>

                <div className="flex flex-wrap gap-2">
                  {technologies.map(
                    (tech) => (
                      <button
                        key={tech}
                        onClick={() =>
                          setSelectedTech(
                            tech
                          )
                        }
                        className={`
                          px-3
                          py-1.5
                          rounded-full
                          text-xs
                          font-medium
                          transition-all

                          ${
                            selectedTech ===
                            tech
                              ? "bg-black text-white"
                              : "bg-zinc-100 hover:bg-zinc-200"
                          }
                        `}
                      >
                        {tech}
                      </button>
                    )
                  )}
                </div>
              </div> */}

              {/* Sort Row */}

              <div
                className="
                  flex
                  flex-wrap
                  justify-between
                  items-center
                  gap-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-zinc-500 dark:text-zinc-400
                  "
                >
                  <Filter size={16} />

                  <span className="font-semibold">
                    {
                      filteredProjects.length
                    }
                  </span>

                  <span>
                    Projects Found
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sortOptions.map(
                    (option) => (
                      <button
                        key={
                          option.value
                        }
                        onClick={() =>
                          setSortBy(
                            option.value
                          )
                        }
                        className={`
                          px-4
                          py-2
                          rounded-xl
                          text-sm
                          font-medium
                          transition-all

                          ${
                            sortBy ===
                            option.value
                              ? "bg-black text-white shadow-lg"
                              : "bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 hover:border-zinc-400"
                          }
                        `}
                      >
                        {
                          option.label
                        }
                      </button>
                    )
                  )}
                </div>
              </div>

              {(search ||
                selectedCategory !==
                  "All" ||
                selectedTech !==
                  "All") && (
                <div
                  className="
                    flex
                    flex-wrap
                    gap-3
                    mt-6
                  "
                >
                  {search && (
                    <span
                      className="
                        px-4
                        py-2
                        rounded-full
                        bg-blue-50 dark:bg-blue-900/30
                        text-blue-700 dark:text-blue-300
                        text-sm
                        font-medium
                      "
                    >
                      Search:
                      {" "}
                      {search}
                    </span>
                  )}

                  {selectedCategory !==
                    "All" && (
                    <span
                      className="
                        px-4
                        py-2
                        rounded-full
                        bg-emerald-50 dark:bg-emerald-900/30
                        text-emerald-700 dark:text-emerald-300
                        text-sm
                        font-medium
                      "
                    >
                      {
                        selectedCategory
                      }
                    </span>
                  )}

                  {selectedTech !==
                    "All" && (
                    <span
                      className="
                        px-4
                        py-2
                        rounded-full
                        bg-purple-50 dark:bg-purple-900/30
                        text-purple-700 dark:text-purple-300
                        text-sm
                        font-medium
                      "
                    >
                      {selectedTech}
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedCategory(
                        "All"
                      );
                      setSelectedTech(
                        "All"
                      );
                      setSortBy(
                        "latest"
                      );
                    }}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-4
                      py-2
                      rounded-full
                      bg-black
                      text-white
                      text-sm
                      font-medium
                    "
                  >
                    <X size={14} />
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Projects Grid */}

        <motion.div
          layout
          className="
            grid
            md:grid-cols-2
            xl:grid-cols-3
            gap-8
          "
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map(
              (project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -20,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                >
                  <ProjectCard
                    project={
                      project
                    }
                  />
                </motion.div>
              )
            )}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length ===
          0 && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="
              text-center
              py-24
            "
          >
            <Search
              size={48}
              className="
                mx-auto
                text-zinc-300 dark:text-zinc-600
                mb-4
              "
            />
            <h3
              className="
                text-2xl
                font-bold
                mb-3
              "
            >
              No Projects Found
            </h3>

            <p className="text-zinc-500 dark:text-zinc-400">
              Try searching with
              different keywords or
              reset the filters.
            </p>
          </motion.div>
        )}

        <CTA />

      </PageWrapper>
    </>
  );
}

export default Projects;