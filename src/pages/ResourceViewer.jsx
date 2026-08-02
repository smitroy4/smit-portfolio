import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import PageWrapper from "../components/common/PageWrapper";
import SEO from "../components/common/SEO";

import ResourceReader from "../components/resources/ResourceReader";

import resources from "../data/resources";
import { loadResource } from "../utils/loadResource";

// Flatten:
// Collections -> Sections -> Items
const allResources = resources.flatMap((collection) =>
  (collection.sections || []).flatMap(
    (section) => section.items || []
  )
);

const findCollectionSlug = (itemSlug) =>
  resources.find((collection) =>
    (collection.sections || []).some((section) =>
      (section.items || []).some(
        (item) => item.slug === itemSlug
      )
    )
  )?.slug || "resources";

function ResourceViewer() {
  const { slug } = useParams();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [slug]);

  const resource = allResources.find(
    (item) => item.slug === slug
  );

  const collectionSlug = findCollectionSlug(slug);

  useEffect(() => {
    let cancelled = false;

    async function fetchContent() {
      const currentResource = allResources.find(
        (item) => item.slug === slug
      );

      if (!currentResource) return;

      setLoading(true);

      const markdown = await loadResource(
        currentResource.file
      );

      if (!cancelled) {
        setContent(
          markdown || "# Content Not Found"
        );
        setLoading(false);
      }
    }

    fetchContent();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!resource) {
    return (
      <PageWrapper>
        <div className="py-24 text-center">
          <h1 className="text-4xl font-black mb-4">
            Resource Not Found
          </h1>

          <Link
            to="/resources"
            className="
              inline-flex
              items-center
              gap-2
              text-blue-600
              font-medium
            "
          >
            ← Back to Resources
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const relatedResources = allResources
    .filter(
      (item) =>
        item.slug !== slug &&
        item.category === resource.category
    )
    .slice(0, 3);

  return (
    <>
      <SEO
        title={resource.title}
        description={resource.description}
      />

      <PageWrapper>
        <div className="max-w-7xl mx-auto">

          {/* Back Button */}
          <Link
            to={`/resources/collection/${collectionSlug}`}
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
            ← Back to {resource.category}
          </Link>

          {/* Header */}
          <header className="mb-12">

            <div
              className="
                inline-flex
                items-center
                px-4
                py-2
                rounded-full
                bg-blue-50
                text-blue-700
                dark:bg-blue-900/50
                dark:text-blue-300
                text-sm
                font-semibold
                mb-5
              "
            >
              {resource.category}
            </div>

            <h1
              className="
                text-4xl
                md:text-5xl
                lg:text-6xl
                font-black
                tracking-tight
                leading-tight
                mb-6
              "
            >
              {resource.title}
            </h1>

            <p
              className="
                text-lg
                md:text-xl
                text-zinc-600
                dark:text-zinc-400
                leading-relaxed
                max-w-4xl
              "
            >
              {resource.description}
            </p>

          </header>

          {/* Markdown Reader */}
          {loading ? (
            <div
              className="
                w-full
                rounded-3xl
                border
                border-zinc-200
                bg-white
                shadow-xl
                py-24
                text-center
                text-zinc-500
              "
            >
              Content Loading...
            </div>
          ) : (
            <ResourceReader
              content={content}
              currentResource={resource}
              allResources={allResources}
            />
          )}

          {/* Related Resources */}
          {relatedResources.length > 0 && (
            <section className="mt-24">

              <div className="mb-10">

                <h2
                  className="
                    text-3xl
                    md:text-4xl
                    font-black
                    tracking-tight
                    mb-3
                  "
                >
                  Related Resources
                </h2>

                <div
                  className="
                    h-1
                    w-20
                    rounded-full
                    bg-gradient-to-r
                    from-blue-600
                    to-cyan-500
                  "
                />
              </div>

              <div
                className="
                  grid
                  md:grid-cols-2
                  lg:grid-cols-3
                  gap-6
                "
              >
                {relatedResources.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/resources/${item.slug}`}
                    className="
                      group
                      rounded-3xl
                      border
                      border-zinc-200
                      bg-white
                      dark:border-zinc-700
                      dark:bg-zinc-800
                      p-6
                      shadow-sm
                      transition-all
                      duration-300
                      hover:-translate-y-2
                      hover:shadow-xl
                      dark:hover:shadow-zinc-900/50
                    "
                  >
                    <div
                      className="
                        inline-flex
                        px-3
                        py-1
                        rounded-full
                        bg-blue-50
                        text-blue-700
                        dark:bg-blue-900/50
                        dark:text-blue-300
                        text-xs
                        font-medium
                        mb-4
                      "
                    >
                      {item.category}
                    </div>

                    <h3
                      className="
                        text-xl
                        font-bold
                        mb-3
                        group-hover:text-blue-600
                        transition-colors
                      "
                    >
                      {item.title}
                    </h3>

                    <p
                      className="
                      text-zinc-600
                      dark:text-zinc-400
                      leading-relaxed
                      "
                    >
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>

            </section>
          )}

        </div>
      </PageWrapper>
    </>
  );
}

export default ResourceViewer;