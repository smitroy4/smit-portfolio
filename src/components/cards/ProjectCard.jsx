import { ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";

function ProjectCard({ project }) {
return ( <article
   className="
     group
     overflow-hidden
     border
     rounded-3xl
     hover:-translate-y-2
     hover:shadow-2xl
     transition-all
     duration-500
   "
 > <img
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

  <div className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-2xl font-bold">
        {project.title}
      </h3>

      <span
        className={`text-xs px-3 py-1 rounded-full ${
          project.status === "Completed"
            ? "bg-green-100 text-green-700"
            : project.status === "Released v1.0.2"
            ? "bg-blue-100 text-blue-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {project.status}
      </span>
    </div>

    <p className="text-zinc-600 mb-5">
      {project.description}
    </p>

    <div className="flex flex-wrap gap-2 mb-5">
      {project.technologies.map((tech) => (
        <span
          key={tech}
          className="px-3 py-1 text-xs border rounded-full"
        >
          {tech}
        </span>
      ))}
    </div>

    <div className="mb-5">
      <h4 className="font-semibold mb-3">
        Key Highlights
      </h4>

      <ul className="space-y-2">
        {project.highlights.map((item) => (
          <li
            key={item}
            className="text-sm text-zinc-600"
          >
            • {item}
          </li>
        ))}
      </ul>
    </div>

    <div className="flex items-center gap-5">
      <a
        href={project.github}
        target="_blank"
        rel="noreferrer"
        className="hover:text-blue-600 transition"
      >
        <FaGithub size={18} />
      </a>

      {project.demo && (
        <a
          href={project.demo}
          target="_blank"
          rel="noreferrer"
          className="hover:text-blue-600 transition"
        >
          <ExternalLink size={18} />
        </a>
      )}
    </div>
  </div>
</article>

);
}

export default ProjectCard;
