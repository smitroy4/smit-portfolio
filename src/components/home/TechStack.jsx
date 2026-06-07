import siteConfig from "../../data/siteConfig";

import TechBadge from "../common/TechBadge";

function TechStack() {
  return (
    <section className="py-10">
      <h2 className="text-2xl font-bold mb-8">
        Tech Stack
      </h2>

      <div className="flex flex-wrap gap-3">
        {siteConfig.techStack.map((tech) => (
          <TechBadge key={tech}>
            {tech}
          </TechBadge>
        ))}
      </div>
    </section>
  );
}

export default TechStack;