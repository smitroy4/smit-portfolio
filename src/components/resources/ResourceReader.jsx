import { Link } from "react-router-dom";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import CodeBlock from "../blog/CodeBlock";

function ResourceNav({
  previousResource,
  nextResource,
}) {
  return (
    <div
      className="
        flex
        flex-wrap
        justify-between
        items-center
        gap-6
        px-6
        py-5
        bg-white
      "
    >
      <div>
        {previousResource && (
          <Link
            to={`/resources/${previousResource.slug}`}
            className="
              inline-flex
              items-center
              px-6
              py-3
              rounded-full
              bg-blue-600
              text-white
              font-semibold
              shadow-lg
              transition-all
              duration-300
              hover:bg-blue-500
              hover:scale-105
            "
          >
            ← Previous Module
          </Link>
        )}
      </div>

      <div>
        {nextResource && (
          <Link
            to={`/resources/${nextResource.slug}`}
            className="
              inline-flex
              items-center
              px-6
              py-3
              rounded-full
              bg-blue-600
              text-white
              font-semibold
              shadow-lg
              transition-all
              duration-300
              hover:bg-blue-500
              hover:scale-105
            "
          >
            Next Module →
          </Link>
        )}
      </div>
    </div>
  );
}

function ResourceReader({
  content,
  currentResource,
  allResources = [],
}) {
  const currentIndex = allResources.findIndex(
    (item) => item.slug === currentResource?.slug
  );

  const previousResource =
    currentIndex > 0
      ? allResources[currentIndex - 1]
      : null;

  const nextResource =
    currentIndex < allResources.length - 1 &&
    currentIndex !== -1
      ? allResources[currentIndex + 1]
      : null;

  return (
    <div
      className="
        w-full
        rounded-3xl
        overflow-hidden
        border
        border-zinc-200
        bg-white
        shadow-xl
      "
    >
      {/* Top Controls */}
      <div
        className="
          sticky
          top-0
          z-30
          bg-white
          border-b
          border-zinc-200
        "
      >
        <ResourceNav
          previousResource={previousResource}
          nextResource={nextResource}
        />
      </div>

      {/* Content Area */}
      <div
        className="
          max-w-[1600px]
          mx-auto
        "
      >
        <article
          className="
            bg-white
            px-4
            sm:px-8
            lg:px-12
            py-8
            md:py-12
          "
        >
          <div
            className="
              blog-content
              resource-content
              max-w-none
            "
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeRaw,
                rehypeSlug,
                rehypeAutolinkHeadings,
              ]}
              components={{
                pre({ children }) {
                  const codeElement = children?.props;

                  const className =
                    codeElement?.className || "";

                  const language =
                    className.replace(
                      "language-",
                      ""
                    ) || "text";

                  return (
                    <CodeBlock language={language}>
                      {codeElement?.children}
                    </CodeBlock>
                  );
                },

                img({ src, alt }) {
                  return (
                    <img
                      src={src}
                      alt={alt}
                      loading="lazy"
                      className="
                        w-full
                        rounded-2xl
                        my-8
                        border
                        border-zinc-200
                        shadow-sm
                      "
                    />
                  );
                },

                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-8 not-prose">
                      <table className="w-full border-collapse border border-zinc-300">
                        {children}
                      </table>
                    </div>
                  );
                },

                thead({ children }) {
                  return (
                    <thead className="bg-zinc-200">
                      {children}
                    </thead>
                  );
                },

                tbody({ children }) {
                  return (
                    <tbody className="bg-white">
                      {children}
                    </tbody>
                  );
                },

                tr({ children }) {
                  return (
                    <tr className="even:bg-zinc-50">
                      {children}
                    </tr>
                  );
                },

                th({ children }) {
                  return (
                    <th
                      className="
                        border
                        border-zinc-300
                        px-4
                        py-3
                        text-left
                        font-semibold
                        text-zinc-900
                      "
                    >
                      {children}
                    </th>
                  );
                },

                td({ children }) {
                  return (
                    <td
                      className="
                        border
                        border-zinc-300
                        px-4
                        py-3
                        text-zinc-700
                      "
                    >
                      {children}
                    </td>
                  );
                },

                a({ href, children }) {
                  if (
                    href &&
                    href.startsWith("#")
                  ) {
                    return (
                      <a
                        href={href}
                        className="
                          text-blue-600
                          hover:text-blue-700
                          font-medium
                          no-underline
                        "
                      >
                        {children}
                      </a>
                    );
                  }

                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        text-blue-600
                        hover:text-blue-700
                        font-medium
                        no-underline
                      "
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </article>
      </div>

      {/* Bottom Controls */}
      <div
        className="
          border-t
          border-zinc-200
          bg-white
        "
      >
        <ResourceNav
          previousResource={previousResource}
          nextResource={nextResource}
        />
      </div>
    </div>
  );
}

export default ResourceReader;
