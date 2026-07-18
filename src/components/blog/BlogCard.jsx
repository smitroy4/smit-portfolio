import { Link } from "react-router-dom";

function BlogCard({ post }) {
  return (
    <Link
      to={`/blogs/${post.slug}`}
      className="
        group
        block
        bg-white
        dark:bg-zinc-800
        border
        border-zinc-200
        dark:border-zinc-700
        rounded-2xl
        overflow-hidden
        shadow-sm
        hover:-translate-y-1
        hover:shadow-lg
        dark:hover:shadow-zinc-900/50
        transition-all
      "
    >
      {post.coverImage && (
        <div className="overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="
              w-full
              aspect-video
              object-cover
              transition-transform
              duration-700
              group-hover:scale-105
            "
          />
        </div>
      )}

      <div className="p-6">
        <div
          className="
            flex
            items-center
            gap-3
            text-sm
            text-zinc-500
            dark:text-zinc-400
            mb-4
          "
        >
          <span>{post.date}</span>

          {post.readTime && (
            <>
              <span>•</span>
              <span>{post.readTime}</span>
            </>
          )}
        </div>

        <h3
          className="
            text-xl
            font-semibold
            mb-3
            group-hover:text-blue-600
            transition-colors
          "
        >
          {post.title}
        </h3>

        <p
          className="
            text-zinc-600
            dark:text-zinc-400
            mb-5
            leading-relaxed
          "
        >
          {post.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="
                px-3
                py-1
                rounded-full
                bg-zinc-100
                dark:bg-zinc-700
                text-zinc-700
                dark:text-zinc-300
                text-xs
                font-medium
              "
            >
              {tag}
            </span>
          ))}
        </div>

        <div
          className="
            text-blue-600
            text-sm
            font-medium
          "
        >
          Read Article →
        </div>
      </div>
    </Link>
  );
}

export default BlogCard;