import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";

import PageWrapper from "../components/common/PageWrapper";
import ResourceCard from "../components/resources/ResourceCard";
import SEO from "../components/common/SEO";

import resources from "../data/resources";
import CTA from "../components/home/CTA";

function ResourceCollectionPage() {
  const { slug } = useParams();

  const collection = resources.find((c) => c.slug === slug);

  if (!collection) {
    return (
      <PageWrapper>
        <div className="py-24 text-center">
          <h1 className="text-4xl font-black mb-4">
            Collection Not Found
          </h1>
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 text-blue-600 font-medium"
          >
            ← Back to Resources
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <>
      <SEO
        title={collection.category}
        description={
          collection.subtitle ||
          `Resources for ${collection.category}`
        }
      />

      <PageWrapper>
        {/* Back */}
        <Link
          to="/resources"
          className="
            inline-flex
            items-center
            gap-2
            mb-10
            text-blue-600
            font-semibold
            hover:text-blue-700
            transition-colors
          "
        >
          ← Back to Resources
        </Link>

        {/* Collection Header */}
        <div className="mb-16">
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
                dark:border-blue-900/50
                dark:bg-blue-900/50
                px-4
                py-2
                text-sm
                font-medium
                text-blue-700
                dark:text-blue-300
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
        <div className="space-y-20">
          {collection.sections.map((section, idx) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
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
                  <ResourceCard key={item.slug} item={item} />
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        <CTA />
      </PageWrapper>
    </>
  );
}

export default ResourceCollectionPage;
