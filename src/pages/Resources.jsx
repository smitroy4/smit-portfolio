import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Database } from "lucide-react";

import PageWrapper from "../components/common/PageWrapper";
import SEO from "../components/common/SEO";

import resources from "../data/resources";
import CTA from "../components/home/CTA";

const collectionLogos = {
  "spring-boot-interview-questions": {
    type: "img",
    src: "/images/resources/spring.svg",
    alt: "Spring",
  },
  "java-interview-questions": {
    type: "img",
    src: "/images/resources/java.svg",
    alt: "Java",
  },
  "sql-interview-questions": {
    type: "icon",
    icon: Database,
    alt: "Database",
  },
  "javascript-interview-questions": {
    type: "img",
    src: "/images/resources/javascript.svg",
    alt: "JavaScript",
  },
  "react-interview-questions": {
    type: "img",
    src: "/images/resources/react.svg",
    alt: "React",
  },
};

function CollectionLogo({ slug }) {
  const logo = collectionLogos[slug];

  if (!logo) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        absolute
        -bottom-5
        -right-5
        h-40
        w-40
        opacity-[0.13]
        mix-blend-multiply
        dark:mix-blend-screen
        dark:opacity-[0.18]
        transition-all
        duration-300
        group-hover:scale-105
      "
      style={{
        maskImage:
          "radial-gradient(ellipse at center, black 55%, transparent 78%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 55%, transparent 78%)",
      }}
    >
      {logo.type === "img" ? (
        <img
          src={logo.src}
          alt={logo.alt}
          className="h-full w-full object-contain"
        />
      ) : (
        <logo.icon
          size={160}
          className="h-full w-full text-blue-700 dark:text-blue-300"
          strokeWidth={1.5}
        />
      )}
    </div>
  );
}

function Resources() {
  const totalResources = resources.reduce(
    (total, collection) =>
      total +
      collection.sections.reduce(
        (sum, section) => sum + section.items.length,
        0,
      ),
    0,
  );

  const totalCollections = resources.length;

  const totalSections = resources.reduce(
    (sum, c) => sum + c.sections.length,
    0,
  );

  return (
    <>
      <SEO
        title="Resources"
        description="Learning resources covering Java, Spring Boot, PostgreSQL, Redis, Kafka, Docker, System Design, and backend engineering."
      />

      <PageWrapper>
        {/* Hero */}
        <section className="relative mb-24 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:60px_60px]" />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 mb-8"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
              </span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Curated Learning Resources
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-8"
            >
              Learning
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Resources
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl mb-12"
            >
              A curated collection of books, courses,
              documentation, videos, notes, and references
              that have helped me throughout my journey in
              backend development, distributed systems,
              cloud-native engineering, and software architecture.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-4xl"
            >
              <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-5 shadow-sm">
                <h3 className="text-3xl font-bold">{totalResources}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Modules</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-5 shadow-sm">
                <h3 className="text-3xl font-bold">{totalSections}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Sections</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-5 shadow-sm">
                <h3 className="text-3xl font-bold">{totalCollections}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  {totalCollections === 1 ? "Collection" : "Collections"}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-5 shadow-sm">
                <h3 className="text-3xl font-bold">From</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Industry Experts</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Collection Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {resources.map((collection) => (
            <Link
              key={collection.slug}
              to={`/resources/collection/${collection.slug}`}
              className="group relative block overflow-hidden border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 bg-white dark:bg-zinc-800 shadow-sm hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-zinc-900/50 transition-all"
            >
              <CollectionLogo slug={collection.slug} />
              <div className="relative">
                <div className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-medium mb-4">
                  Resource Collection
                </div>
                <h3 className="font-semibold text-lg mb-3 group-hover:text-blue-600 transition-colors">
                  {collection.category}
                </h3>
                {collection.subtitle && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                    {collection.subtitle}
                  </p>
                )}
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  {collection.sections.length} sections ·{" "}
                  {collection.sections.reduce((sum, s) => sum + s.items.length, 0)} modules
                </p>
                <div className="mt-4 text-blue-600 text-sm font-medium">
                  Browse Collection →
                </div>
              </div>
            </Link>
          ))}
        </div>

        <CTA />
      </PageWrapper>
    </>
  );
}

export default Resources;