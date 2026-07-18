import { useMemo, useState } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Filter,
  Search,
  Sparkles,
  X,
  Clock3,
} from "lucide-react";

import PageWrapper from "../components/common/PageWrapper";
import BlogCard from "../components/blog/BlogCard";
import BlogSearch from "../components/blog/BlogSearch";
import blogMetadata from "../data/blogMetadata";
import SEO from "../components/common/SEO";

function Blogs() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("latest");

  const categories = [
    "All",
    "Handbook",
    "Article",
    "Cheatsheet",
    "Roadmap",
  ];

  const sortOptions = [
    {
      value: "latest",
      label: "Latest",
    },
    {
      value: "oldest",
      label: "Oldest",
    },
    {
      value: "title",
      label: "A-Z",
    },
    {
      value: "readTime",
      label: "Read Time",
    },
  ];

  const totalReadingTime =
    blogMetadata.reduce(
      (sum, post) =>
        sum +
        parseInt(post.readTime || "0"),
      0
    );

  const filteredPosts = useMemo(() => {
    let posts = [...blogMetadata];

    if (search) {
      posts = posts.filter((post) =>
        (
          post.title +
          " " +
          post.description +
          " " +
          post.tags.join(" ")
        )
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (selectedTag !== "All") {
      posts = posts.filter((post) =>
        post.tags.includes(selectedTag)
      );
    }

    switch (sortBy) {
      case "title":
        posts.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        break;

      case "readTime":
        posts.sort(
          (a, b) =>
            parseInt(b.readTime || 0) -
            parseInt(a.readTime || 0)
        );
        break;

      case "oldest":
        posts.reverse();
        break;

      case "latest":
      default:
        break;
    }

    return posts;
  }, [search, selectedTag, sortBy]);

  const featuredPost =
    filteredPosts[0] || blogMetadata[0];

  return (
    <>
      <SEO
        title="Technical Blogs"
        description="Technical articles on Java, Spring Boot, Spring Security, Redis, Kafka, System Design, Microservices, and modern backend engineering."
      />

      <PageWrapper>
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
                Sharing What I Learn
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
              Technical

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
                Articles & Learnings
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
                dark:text-zinc-400
                leading-relaxed
                max-w-3xl
                mb-12
              "
            >
              Notes, deep dives, and practical
              learnings on Java, Spring Boot,
              Microservices, Security,
              Databases, System Design,
              and modern backend engineering.
            </motion.p>
                        <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
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
                  value: blogMetadata.length,
                  label: "Articles",
                },
                {
                  value: `${totalReadingTime}m`,
                  label: "Reading Time",
                },
                {
                  value: "Java",
                  label: "Core Focus",
                },
                {
                  value: "Spring",
                  label: "Ecosystem",
                },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{
                    y: -5,
                    scale: 1.02,
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
                  <h3 className="text-3xl font-bold">
                    {item.value}
                  </h3>

                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Featured Article */}

            {/* {featuredPost && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                whileHover={{
                  y: -4,
                }}
                className="
                  mb-12
                  rounded-3xl
                  border
                  border-zinc-200
                  bg-gradient-to-br
                  from-blue-50
                  via-white
                  to-cyan-50
                  p-8
                  shadow-sm
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
                    Featured Article
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
                  {featuredPost.title}
                </h2>

                <p
                  className="
                    text-zinc-600
                    max-w-3xl
                  "
                >
                  {featuredPost.description}
                </p>
              </motion.div>
            )} */}

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
              <div className="max-w-2xl mb-6">
                <BlogSearch
                  value={search}
                  onChange={setSearch}
                />
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                {categories.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTag(tag)
                    }
                    className={`
                      px-4
                      py-2
                      rounded-xl
                      text-sm
                      font-medium
                      transition-all

                      ${
                        selectedTag === tag
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 hover:border-blue-400"
                      }
                    `}
                  >
                    {tag}
                  </button>
                ))}
              </div>

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
                    {filteredPosts.length}
                  </span>

                  <span>
                    Articles Found
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sortOptions.map(
                    (option) => (
                      <button
                        key={option.value}
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
                        {option.label}
                      </button>
                    )
                  )}
                </div>
              </div>

              {(search ||
                selectedTag !== "All") && (
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
                      Search: {search}
                    </span>
                  )}

                  {selectedTag !==
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
                      {selectedTag}
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedTag(
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
            {filteredPosts.map(
              (post) => (
                <motion.div
                  key={post.slug}
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
                  <BlogCard
                    post={post}
                  />
                </motion.div>
              )
            )}
          </AnimatePresence>
        </motion.div>

        {filteredPosts.length ===
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
              No Articles Found
            </h3>

            <p className="text-zinc-500 dark:text-zinc-400">
              Try searching with
              different keywords or
              reset your filters.
            </p>
          </motion.div>
        )}
      </PageWrapper>
    </>
  );
}

export default Blogs;