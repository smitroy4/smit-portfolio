import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Filter, ArrowUpDown } from "lucide-react";

import PageWrapper from "../components/common/PageWrapper";

import BlogCard from "../components/blog/BlogCard";
import BlogSearch from "../components/blog/BlogSearch";

import blogMetadata from "../data/blogMetadata";

import SEO from "../components/common/SEO";

function Blogs() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  const categories = [
    "All",
    "Java",
    "DBMS",
    "Spring Boot",
    "DevOps & Deloyment",
    "Web Development",
    "System Design",
    "RAG & Gen AI"
  ];

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
            parseInt(b.readTime) -
            parseInt(a.readTime)
        );
        break;

      default:
        break;
    }

    return posts;
  }, [search, selectedTag, sortBy]);

  return (
    <>
      <SEO
        title="Technical Blogs"
        description="Technical articles on Java, Spring Boot, Spring Security, Redis, Kafka, System Design, Microservices, and modern backend engineering."
      />

      <PageWrapper>
        <section className="relative mb-24 overflow-hidden">
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
                Sharing What I Learn
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
                Articles &
                <span className="text-black">
                  {" "}
                  Learnings
                </span>
              </span>
            </motion.h1>

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
              Notes, deep dives, and practical
              learnings on Java, Spring Boot,
              Microservices, Security, Databases,
              System Design, and modern backend
              engineering.
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
                max-w-4xl
                mb-12
              "
            >
              {[
                {
                  value: blogMetadata.length,
                  label: "Articles",
                },
                {
                  value: "Java",
                  label: "Core Focus",
                },
                {
                  value: "Spring",
                  label: "Ecosystem",
                },
                {
                  value: "OSS",
                  label: "Learning Notes",
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
                    border-zinc-200
                    bg-white
                    p-5
                    shadow-sm
                  "
                >
                  <h3 className="text-3xl font-bold">
                    {item.value}
                  </h3>

                  <p className="text-zinc-500 text-sm mt-1">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl"
            >
              <BlogSearch
                value={search}
                onChange={setSearch}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
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
                          : "bg-white border border-zinc-200 hover:border-blue-300"
                      }
                    `}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Filter size={16} />
                  <span>
                    {filteredPosts.length} Articles
                  </span>
                </div>

                <div className="relative">
                  <ArrowUpDown
                    size={16}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-zinc-400
                    "
                  />

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value
                      )
                    }
                    className="
                      pl-10
                      pr-4
                      py-3
                      rounded-xl
                      border
                      border-zinc-200
                      bg-white
                      outline-none
                      focus:border-blue-500
                    "
                  >
                    <option value="latest">
                      Latest
                    </option>

                    <option value="title">
                      A → Z
                    </option>

                    <option value="readTime">
                      Longest Read
                    </option>
                  </select>
                </div>
              </div>

              {(search ||
                selectedTag !== "All") && (
                <div className="flex flex-wrap gap-3 mt-6">
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
                      Search: {search}
                    </span>
                  )}

                  {selectedTag !== "All" && (
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
                      {selectedTag}
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedTag("All");
                    }}
                    className="
                      px-4
                      py-2
                      rounded-full
                      bg-zinc-100
                      hover:bg-zinc-200
                      text-sm
                      font-medium
                    "
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-8">
          {filteredPosts.map((post) => (
            <BlogCard
              key={post.slug}
              post={post}
            />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold mb-3">
              No Articles Found
            </h3>

            <p className="text-zinc-500">
              Try searching with different
              keywords.
            </p>
          </div>
        )}
      </PageWrapper>
    </>
  );
}

export default Blogs;