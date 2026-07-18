import { Link } from "react-router-dom";

function ResourceCard({ item }) {
  return (
    <Link
      to={`/resources/${item.slug}`}
      className="
        group
        block
        border
        border-zinc-200
        dark:border-zinc-700
        rounded-2xl
        p-6
        bg-white
        dark:bg-zinc-800
        shadow-sm
        hover:-translate-y-1
        hover:shadow-lg
        dark:hover:shadow-zinc-900/50
        transition-all
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
          font-semibold
          text-lg
          mb-3
          group-hover:text-blue-600
        "
      >
        {item.title}
      </h3>

      <p className="text-zinc-600 dark:text-zinc-400">
        {item.description}
      </p>

      <div
        className="
          mt-4
          text-blue-600
          text-sm
          font-medium
        "
      >
        Read Resource →
      </div>
    </Link>
  );
}

export default ResourceCard;