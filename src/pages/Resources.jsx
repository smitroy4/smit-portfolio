import { motion } from "framer-motion";

import PageWrapper from "../components/common/PageWrapper";
import ResourceCard from "../components/resources/ResourceCard";
import SEO from "../components/common/SEO";

import resources from "../data/resources";
import CTA from "../components/home/CTA";

function Resources() {
  const totalResources = resources.reduce(
    (total, collection) =>
      total +
      collection.sections.reduce(
        (sum, section) => sum + section.items.length,
        0
      ),
    0
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
                Curated Learning Resources
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
              A curated collection of books, courses,
              documentation, videos, notes, and references
              that have helped me throughout my journey in
              backend development, distributed systems,
              cloud-native engineering, and software architecture.
            </motion.p>

            {/* Stats */}
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
                  {totalResources}
                </h3>

                <p className="text-zinc-500 text-sm mt-1">
                  Resources
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
                  Backend
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
                  Spring
                </h3>

                <p className="text-zinc-500 text-sm mt-1">
                  Ecosystem
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
                  System
                </h3>

                <p className="text-zinc-500 text-sm mt-1">
                  Design
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Resource Collections */}
        <div className="space-y-24">
          {resources.map((collection, collectionIndex) => (
            <motion.section
              key={collection.category}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: collectionIndex * 0.1,
              }}
              className="space-y-14"
            >
              {/* Collection Header */}
              <div>
                <h2
                  className="
                    text-4xl
                    md:text-5xl
                    font-black
                    tracking-tight
                    mb-4
                  "
                >
                  {collection.category}
                </h2>

                {collection.subtitle && (
                  <div
                    className="
                      inline-flex
                      items-center
                      rounded-full
                      border
                      border-blue-100
                      bg-blue-50
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-blue-700
                      mb-6
                    "
                  >
                    {collection.subtitle}
                  </div>
                )}

                <div
                  className="
                    h-1
                    w-28
                    rounded-full
                    bg-gradient-to-r
                    from-blue-600
                    to-cyan-500
                  "
                />
              </div>

              {/* Sections */}
              {collection.sections.map((section) => (
                <div key={section.title}>
                  <h3
                    className="
                      text-2xl
                      md:text-3xl
                      font-bold
                      tracking-tight
                      mb-6
                    "
                  >
                    {section.title}
                  </h3>

                  <div
                    className="
                      grid
                      md:grid-cols-2
                      lg:grid-cols-3
                      gap-6
                    "
                  >
                    {section.items.map((item) => (
                      <ResourceCard
                        key={item.slug}
                        item={item}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.section>
          ))}
        </div>

        <CTA />
      </PageWrapper>
    </>
  );
}

export default Resources;