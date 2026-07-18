import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import PageWrapper from "../components/common/PageWrapper";

import CodeBlock from "../components/blog/CodeBlock";
import TableOfContents from "../components/blog/TableOfContents";
import ReadingProgress from "../components/blog/ReadingProgress";
import RelatedBlogs from "../components/blog/RelatedBlogs";
import BlogSkeleton from "../components/blog/BlogSkeleton";

import SEO from "../components/common/SEO";

import { loadBlog } from "../utils/loadBlog";

import blogMetadata from "../data/blogMetadata";

import "react-medium-image-zoom/dist/styles.css";
import Zoom from "react-medium-image-zoom";

function BlogPost() {
  const { slug } = useParams();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [rendered, setRendered] = useState(false);

  const blog = blogMetadata.find((item) => item.slug === slug);

  useEffect(() => {
    async function fetchBlog() {
      setLoading(true);
      setRendered(false);

      const start = Date.now();

      const markdown = await loadBlog(slug);

      setContent(markdown || "# Not Found");

      const elapsed = Date.now() - start;

      const minimumSkeletonTime = 1200;

      const remaining = Math.max(0, minimumSkeletonTime - elapsed);

      setTimeout(() => {
        setLoading(false);
      }, remaining);

      window.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }

    fetchBlog();
  }, [slug]);

  useEffect(() => {
    if (!content || loading) return;

    const timer = setTimeout(() => {
      setRendered(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [content, loading]);

  if (loading || !rendered) {
    return (
      <PageWrapper>
        <BlogSkeleton />
      </PageWrapper>
    );
  }

  return (
    <>
      <SEO
        title={blog?.title || "Technical Blog"}
        description={
          blog?.description ||
          "Technical article by Smit Roy covering backend development, Java, Spring Boot, and software engineering."
        }
      />

      <ReadingProgress />

      <PageWrapper>
        <div
          className="
            bg-white
            text-zinc-900
            rounded-3xl
            my-6
            px-4
            sm:px-8
            lg:px-12
            py-8
            md:py-12
            shadow-xl
            shadow-zinc-900/10
            border
            border-zinc-200/50
          "
        >
        <div
          className="
            max-w-[1600px]
            mx-auto
            flex
            gap-12
            items-start
          "
        >
          <article
            className="
              flex-1
              min-w-0
            "
          >
            {blog && (
              <header className="mb-16">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="
                    w-full
                    rounded-3xl
                    mb-8
                    object-cover
                    max-h-[500px]
                    border
                    border-zinc-200
                  "
                />

                <div className="flex flex-wrap gap-3 mb-6">
                  {blog.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="
                        px-3
                        py-1
                        rounded-full
                        bg-blue-50
                        text-blue-700
                        text-sm
                        font-medium
                      "
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h1
                  className="
                    text-4xl
                    md:text-5xl
                    font-black
                    tracking-tight
                    leading-tight
                    mb-6
                  "
                >
                  {blog.title}
                </h1>

                <p
                  className="
                    text-lg
                    text-zinc-600
                    mb-8
                    leading-relaxed
                  "
                >
                  {blog.description}
                </p>

                <div
                  className="
                    flex
                    flex-wrap
                    gap-6
                    text-sm
                    text-zinc-500
                    border-t
                    border-b
                    border-zinc-200
                    py-4
                  "
                >
                  <span>{blog.date}</span>

                  <span>{blog.readTime}</span>
                </div>
              </header>
            )}

            <div
              className="
                blog-content
                prose
                prose-zinc
                lg:prose-lg
                max-w-none


              "
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSlug, rehypeAutolinkHeadings]}
                components={{
                  pre({ children }) {
                    const codeElement = children?.props;

                    const className = codeElement?.className || "";

                    const language =
                      className.replace("language-", "") || "text";

                    return (
                      <CodeBlock language={language}>
                        {codeElement?.children}
                      </CodeBlock>
                    );
                  },

                  img({ src, alt }) {
                    return (
                      <Zoom>
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
            cursor-zoom-in
            transition
            hover:shadow-lg:shadow-zinc-900/50
          "
                        />
                      </Zoom>
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
                    return <thead className="bg-zinc-200">{children}</thead>;
                  },

                  tbody({ children }) {
                    return <tbody className="bg-white">{children}</tbody>;
                  },

                  tr({ children }) {
                    return <tr className="even:bg-zinc-50">{children}</tr>;
                  },

                  th({ children }) {
                    return (
                      <th
                        className="
                          border border-zinc-300
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
                          border border-zinc-300
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
                    if (href && href.startsWith("#")) {
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

            <RelatedBlogs currentSlug={slug} />
          </article>

          

<aside
  style={{
    position: "sticky",
    top: "80px",
    alignSelf: "flex-start",
    maxHeight: "calc(100vh - 96px)",
  }}
  className="
    hidden
    xl:block
    w-80
    shrink-0
  "
>
  <TableOfContents />
</aside>
        </div>
        </div>
      </PageWrapper>
    </>
  );
}

export default BlogPost;
