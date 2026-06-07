import { useMemo, useState } from "react";

import PageWrapper from "../components/common/PageWrapper";

import BlogCard from "../components/blog/BlogCard";
import BlogSearch from "../components/blog/BlogSearch";

import blogMetadata from "../data/blogMetadata";

function Blogs() {
  const [search, setSearch] = useState("");

  const filteredPosts = useMemo(() => {
    return blogMetadata.filter((post) =>
      post.title
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <PageWrapper>

      <div className="mb-12">
        <p className="text-blue-600 font-medium mb-2">
          Blog
        </p>

        <h1 className="text-5xl font-bold mb-6">
          Technical Articles
        </h1>

        <p className="text-zinc-600 max-w-3xl">
          Notes, learnings, and articles on
          backend development, Spring Boot,
          databases, system design, and
          software engineering.
        </p>
      </div>

      <div className="mb-10">
        <BlogSearch
          value={search}
          onChange={setSearch}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {filteredPosts.map((post) => (
          <BlogCard
            key={post.slug}
            post={post}
          />
        ))}
      </div>

    </PageWrapper>
  );
}

export default Blogs;