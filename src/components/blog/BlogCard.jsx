import { Link } from "react-router-dom";

function BlogCard({ post }) {
  return (
    <article
      className="
        overflow-hidden
        border
        rounded-2xl
        hover:shadow-lg
        transition
        duration-300
      "
    >
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="
            w-full
            aspect-video
            object-cover
          "
        />
      )}

      <div className="p-6">
        <div className="flex items-center gap-3 text-sm text-zinc-500 mb-3">
          <span>{post.date}</span>

          {post.readTime && (
            <>
              <span>•</span>
              <span>{post.readTime}</span>
            </>
          )}
        </div>

        <h3 className="text-2xl font-bold mb-3">
          {post.title}
        </h3>

        <p className="text-zinc-600 mb-5 leading-relaxed">
          {post.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="
                text-xs
                px-2.5
                py-1
                rounded-md
                border
                bg-zinc-50
              "
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          to={`/blogs/${post.slug}`}
          className="
            inline-flex
            items-center
            font-medium
            text-blue-600
            hover:text-blue-700
          "
        >
          Read Article →
        </Link>
      </div>
    </article>
  );
}

export default BlogCard;