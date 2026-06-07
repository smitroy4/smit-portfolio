import projects from "../../data/projects";

import ProjectCard from "../cards/ProjectCard";

function FeaturedProjects() {
  return (
    <section className="py-16">
      <h2 className="text-2xl font-bold mb-8">
        Featured Projects
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {projects.slice(0, 2).map((project) => (
          <ProjectCard
            key={project.title}
            project={project}
          />
        ))}
      </div>
    </section>
  );
}

export default FeaturedProjects;