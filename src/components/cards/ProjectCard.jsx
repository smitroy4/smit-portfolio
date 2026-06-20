import { ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";

function ProjectCard({ project }) {
  const statusStyles = {
    Completed: "bg-green-50 text-green-700",
    Released: "bg-blue-50 text-blue-700",
    Ongoing: "bg-yellow-50 text-yellow-700",
  };

  return (
    <article
      className="
        group
        bg-white
        border
        border-zinc-200
        rounded-2xl
        overflow-hidden
        shadow-sm
        hover:-translate-y-1
        hover:shadow-lg
        transition-all
      "
    >
      <div className="overflow-hidden">
        <img
          src={project.banner}
          alt={project.title}
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

      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3
            className="
              text-xl
              font-semibold
              group-hover:text-blue-600
              transition-colors
            "
          >
            {project.title}
          </h3>

          <span
            className={`
              shrink-0
              px-3
              py-1
              rounded-full
              text-xs
              font-medium
              ${
                statusStyles[project.status] ||
                "bg-zinc-100 text-zinc-700"
              }
            `}
          >
            {project.status}
          </span>
        </div>

        <p className="text-zinc-600 mb-5 leading-relaxed">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="
                px-3
                py-1
                rounded-full
                bg-zinc-100
                text-zinc-700
                text-xs
                font-medium
              "
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-zinc-500">
            Key Highlights
          </h4>

          <ul className="space-y-2">
            {project.highlights.map((item) => (
              <li
                key={item}
                className="text-sm text-zinc-600 flex gap-2"
              >
                <span className="text-blue-600 mt-[2px]">
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-zinc-100">
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="
              flex
              items-center
              gap-2
              px-4
              py-2
              rounded-xl
              border
              border-zinc-200
              hover:bg-zinc-50
              transition
            "
          >
            <FaGithub size={16} />
            <span className="text-sm font-medium">
              GitHub
            </span>
          </a>

          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="
                flex
                items-center
                gap-2
                px-4
                py-2
                rounded-xl
                bg-blue-600
                text-white
                hover:bg-blue-700
                transition
              "
            >
              <ExternalLink size={16} />
              <span className="text-sm font-medium">
                Live Demo
              </span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;