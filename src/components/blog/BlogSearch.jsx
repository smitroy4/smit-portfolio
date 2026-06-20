import { Search, X } from "lucide-react";

function BlogSearch({
  value,
  onChange,
}) {
  return (
    <div className="relative group">
      <Search
        size={20}
        className="
          absolute
          left-5
          top-1/2
          -translate-y-1/2
          text-zinc-400
          group-focus-within:text-blue-600
          transition-colors
          duration-300
          pointer-events-none
        "
      />

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="Search Java, Spring Boot, Microservices, Kafka..."
        className="
          w-full
          h-16
          rounded-2xl
          border
          border-zinc-200
          bg-white
          pl-14
          pr-14
          text-base
          font-medium
          text-zinc-800
          placeholder:text-zinc-400
          shadow-sm
          transition-all
          duration-300
          outline-none
          hover:border-zinc-300
          hover:shadow-md
          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-100
          focus:shadow-lg
        "
      />

      {value && (
        <button
          onClick={() => onChange("")}
          className="
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            flex
            items-center
            justify-center
            w-8
            h-8
            rounded-full
            bg-zinc-100
            text-zinc-500
            hover:bg-zinc-200
            hover:text-zinc-700
            transition-all
          "
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default BlogSearch;