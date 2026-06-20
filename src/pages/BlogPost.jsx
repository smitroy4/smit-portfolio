import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import PageWrapper from "../components/common/PageWrapper";
import CodeBlock from "../components/blog/CodeBlock";
import ReadingProgress from "../components/blog/ReadingProgress";
import RelatedBlogs from "../components/blog/RelatedBlogs";

import SEO from "../components/common/SEO";

import { loadBlog } from "../utils/loadBlog";

import blogMetadata from "../data/blogMetadata";

function BlogPost() {
const { slug } = useParams();

const [content, setContent] = useState("");
const [loading, setLoading] = useState(true);

const blog = blogMetadata.find(
(item) => item.slug === slug
);

useEffect(() => {
async function fetchBlog() {
const markdown = await loadBlog(slug);

  setContent(markdown || "# Not Found");

  setLoading(false);

  window.scrollTo({
    top: 0,
    behavior: "instant",
  });
}

fetchBlog();


}, [slug]);

if (loading) {
return ( <PageWrapper> <p>Loading article...</p> </PageWrapper>
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
    <article className="max-w-4xl mx-auto">

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
          prose
          prose-zinc
          lg:prose-lg
          max-w-none
        "
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            pre({ children }) {
              return (
                <CodeBlock>
                  {children.props.children}
                </CodeBlock>
              );
            },

            table({ children }) {
              return (
                <div className="overflow-x-auto my-8">
                  <table className="w-full border-collapse">
                    {children}
                  </table>
                </div>
              );
            },

            thead({ children }) {
              return (
                <thead className="bg-zinc-100">
                  {children}
                </thead>
              );
            },

            th({ children }) {
              return (
                <th className="border px-4 py-3 text-left font-semibold">
                  {children}
                </th>
              );
            },

            td({ children }) {
              return (
                <td className="border px-4 py-3">
                  {children}
                </td>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      <RelatedBlogs currentSlug={slug} />

    </article>
  </PageWrapper>
</>


);
}

export default BlogPost;
