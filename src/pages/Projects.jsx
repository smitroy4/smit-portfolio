import PageWrapper from "../components/common/PageWrapper";
import ProjectCard from "../components/cards/ProjectCard";

import projects from "../data/projects";

function Projects() {
  return (
    <PageWrapper>

      <div className="mb-16">
        <p className="text-blue-600 font-medium mb-2">
          Projects
        </p>

        <h1 className="text-5xl font-bold mb-6">
          Backend Systems & Open Source Work
        </h1>

        <p className="max-w-3xl text-zinc-600">
          A collection of backend systems, open-source
          libraries, and production-oriented projects
          focused on scalability, security, distributed
          systems, and modern software architecture.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
          />
        ))}
      </div>

    </PageWrapper>
  );
}

export default Projects;