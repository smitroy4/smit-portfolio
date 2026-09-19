import { FaGithub, FaLinkedin } from "react-icons/fa";

function AuthorBox({ author }) {
  if (!author) return null;

  return (
    <div
      className="
        flex
        flex-col
        sm:flex-row
        gap-5
        items-start
        bg-zinc-50
        border
        border-zinc-200
        rounded-2xl
        p-6
        mt-8
        mb-8
      "
    >
      <img
        src={author.image}
        alt={author.name}
        className="
          w-16
          h-16
          rounded-full
          object-cover
          object-top
          shrink-0
          border
          border-zinc-200
        "
      />

      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">
          Written by
        </p>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-lg font-bold text-zinc-900">{author.name}</h2>

          {author.role && (
            <span className="text-sm text-zinc-500">{author.role}</span>
          )}
        </div>

        {author.description && (
          <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
            {author.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {author.linkedin && (
            <a
              href={author.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-lg
                text-sm
                font-medium
                border
                border-zinc-300
                text-zinc-700
                hover:bg-white
                hover:border-blue-300
                transition
              "
            >
              <FaLinkedin className="text-blue-600" />
              LinkedIn
            </a>
          )}

          {author.github && (
            <a
              href={author.github}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-lg
                text-sm
                font-medium
                border
                border-zinc-300
                text-zinc-700
                hover:bg-zinc-900
                hover:text-white
                hover:border-zinc-900
                transition
              "
            >
              <FaGithub />
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthorBox;