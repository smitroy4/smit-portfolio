import { useMemo, useState } from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Search,
  Filter,
  BookOpen,
  GraduationCap,
  Database,
  Sparkles,
  X,
} from "lucide-react";

import PageWrapper from "../components/common/PageWrapper";
import ResourceCard from "../components/resources/ResourceCard";
import SEO from "../components/common/SEO";
import CTA from "../components/home/CTA";

import resources from "../data/resources";

function Resources() {
  const [search, setSearch] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  const allResources =
    resources.flatMap((collection) =>
      collection.sections.flatMap(
        (section) =>
          section.items.map((item) => ({
            ...item,
            collection:
              collection.category,
            section:
              section.title,
          }))
      )
    );

  const categories = [
    "All",
    ...new Set(
      allResources.map(
        (item) => item.category
      )
    ),
  ];

  const filteredResources =
    useMemo(() => {
      let result = [
        ...allResources,
      ];

      if (search) {
        result = result.filter(
          (item) =>
            (
              item.title +
              " " +
              item.description +
              " " +
              item.category +
              " " +
              item.section
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
          (item) =>
            item.category ===
            selectedCategory
        );
      }

      return result;
    }, [
      search,
      selectedCategory,
      allResources,
    ]);

  const totalResources =
    allResources.length;

  return (
    <>
      <SEO
        title="Resources"
        description="Learning resources covering Java, Spring Boot, PostgreSQL, Redis, Kafka, Docker, System Design, and backend engineering."
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
              transition={{
                duration: 0.5,
              }}
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
                Curated Learning Resources
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
              transition={{
                duration: 0.6,
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
              Learning

              <span
                className="
                  block
                  bg-gradient-to-r
                  from-blue-600
                  to-cyan-500
                  bg-clip-text
                  text-transparent
                "
              >
                Resources
              </span>
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
                text-zinc-600
                leading-relaxed
                max-w-3xl
                mb-12
              "
            >
              A curated collection of
              books, notes, PDFs,
              documentation, videos,
              and learning material that
              helped me understand
              backend engineering,
              distributed systems,
              cloud-native architecture,
              DevOps, and modern Java
              development.
            </motion.p>

            {/* Stats */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.3,
              }}
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
                    totalResources,
                  label:
                    "Resources",
                  icon:
                    BookOpen,
                },
                {
                  value:
                    "Java",
                  label:
                    "Backend Focus",
                  icon:
                    GraduationCap,
                },
                {
                  value:
                    "Spring",
                  label:
                    "Ecosystem",
                  icon:
                    Database,
                },
                {
                  value:
                    categories.length -
                    1,
                  label:
                    "Topics",
                  icon:
                    Sparkles,
                },
              ].map(
                (item) => {
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
                        border-zinc-200
                        bg-white
                        p-5
                        shadow-sm
                      "
                    >
                      <Icon
                        size={18}
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

                      <p className="text-zinc-500 text-sm mt-1">
                        {
                          item.label
                        }
                      </p>
                    </motion.div>
                  );
                }
              )}
            </motion.div>
                        {/* Sticky Toolbar */}

            <div
              className="
                sticky
                top-4
                z-30
                rounded-3xl
                border
                border-zinc-200
                bg-white/80
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
                  placeholder="Search Spring Boot, Security, Kafka, Docker..."
                  className="
                    w-full
                    h-16
                    rounded-2xl
                    border
                    border-zinc-200
                    bg-white
                    pl-14
                    pr-14
                    text-base
                    font-medium
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
                      flex
                      items-center
                      justify-center
                      w-8
                      h-8
                      rounded-full
                      bg-zinc-100
                    "
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Categories */}

              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {categories.map(
                    (category) => (
                      <button
                        key={category}
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
                              : "bg-white border border-zinc-200 hover:border-blue-400"
                          }
                        `}
                      >
                        {category}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Result Count */}

              <div
                className="
                  flex
                  flex-wrap
                  justify-between
                  items-center
                  gap-4
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-zinc-500
                  "
                >
                  <Filter size={16} />

                  <span className="font-semibold">
                    {
                      filteredResources.length
                    }
                  </span>

                  <span>
                    Resources Found
                  </span>
                </div>
              </div>

              {/* Active Filters */}

              {(search ||
                selectedCategory !==
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
                        bg-blue-50
                        text-blue-700
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
                        bg-emerald-50
                        text-emerald-700
                        text-sm
                        font-medium
                      "
                    >
                      {
                        selectedCategory
                      }
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedCategory(
                        "All"
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

        {/* Resources Grid */}

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
            {filteredResources.map(
              (item) => (
                <motion.div
                  key={item.slug}
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
                  <ResourceCard
                    item={item}
                  />
                </motion.div>
              )
            )}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}

        {filteredResources.length ===
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
                text-zinc-300
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
              No Resources Found
            </h3>

            <p className="text-zinc-500">
              Try searching with
              different keywords or
              clear the active
              filters.
            </p>
          </motion.div>
        )}

        <CTA />

      </PageWrapper>
    </>
  );
}

export default Resources;