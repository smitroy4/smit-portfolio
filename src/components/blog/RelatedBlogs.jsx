import { Link } from "react-router-dom";

import blogMetadata from "../../data/blogMetadata";

function RelatedBlogs({ currentSlug }) {
  const related = [...blogMetadata]
    .filter(
      (blog) => blog.slug !== currentSlug
    )
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return (
    <section className="mt-24">
      <h2
        className="
          text-3xl
          font-bold
          mb-8
        "
      >
        Related Articles
      </h2>

      <div
        className="
          grid
          md:grid-cols-3
          gap-6
        "
      >
        {related.map((blog) => (
          <Link
            key={blog.slug}
            to={`/blogs/${blog.slug}`}
            className="
              group
              border
              border-zinc-200

              rounded-2xl
              overflow-hidden
              bg-white

              hover:shadow-lg

              transition-all
            "
          >
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="
                h-48
                w-full
                object-cover
              "
            />

            <div className="p-5">
              <h3
                className="
                  font-bold
                  text-lg
                  mb-2
                  group-hover:text-blue-600
                  transition-colors
                "
              >
                {blog.title}
              </h3>

              <p
                className="
                  text-zinc-500

                  text-sm
                  line-clamp-3
                "
              >
                {blog.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RelatedBlogs;
