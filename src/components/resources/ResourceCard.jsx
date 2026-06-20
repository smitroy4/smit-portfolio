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
        rounded-2xl
        p-6
        bg-white
        shadow-sm
        hover:-translate-y-1
        hover:shadow-lg
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

      <p className="text-zinc-600">
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