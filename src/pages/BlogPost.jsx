import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import PageWrapper from "../components/common/PageWrapper";
import CodeBlock from "../components/blog/CodeBlock";

import { loadBlog } from "../utils/loadBlog";


function BlogPost() {
  const { slug } = useParams();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlog() {
      const markdown = await loadBlog(slug);

      setContent(markdown || "# Not Found");

      setLoading(false);
    }

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <PageWrapper>
        <p>Loading article...</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <article className="max-w-4xl mx-auto">
        <div className="prose prose-zinc max-w-none">
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
      </article>
    </PageWrapper>
  );
}

export default BlogPost;