import { motion } from "framer-motion";

import {
  Server,
  Database,
  Cloud,
  Code2,
  Boxes,
  Monitor,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import TechBadge from "../common/TechBadge";

function TechStack() {
  const groups = [
    {
      title: "Backend Development",
      icon: Server,
      tech: [
        "Java",
        "Spring Boot",
        "Spring MVC",
        "Spring Security",
        "Spring Data JPA",
        "Hibernate",
        "REST APIs",
        "JWT",
        "OAuth2",
        "Maven",
        "Validation",
      ],
    },

    {
      title: "Microservices & Distributed Systems",
      icon: Boxes,
      tech: [
        "Microservices",
        "Spring Cloud",
        "Eureka",
        "OpenFeign",
        "API Gateway",
        "Resilience4J",
        "Kafka",
        "Zipkin",
        "Distributed Tracing",
        "ELK Stack",
        "Event-Driven Architecture",
      ],
    },

    {
      title: "Databases & Storage",
      icon: Database,
      tech: [
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "Redis",
        "SQL",
        "JPQL",
        "Database Design",
        "Caching",
      ],
    },

    {
      title: "Cloud & DevOps",
      icon: Cloud,
      tech: [
        "Docker",
        "Kubernetes",
        "Render",
        "GitHub Actions",
        "CI/CD",
        "Linux",
        "Cloud Deployment",
        "Containerization",
      ],
    },

    {
      title: "Frontend Basics",
      icon: Monitor,
      tech: [
        "React",
        "JavaScript",
        "HTML",
        "CSS",
        "Tailwind CSS",
        "Vite",
        "Framer Motion",
        "Responsive Design",
      ],
    },

    {
      title: "AI & Modern Engineering",
      icon: Sparkles,
      tech: [
        "Spring AI",
        "RAG",
        "LLMs",
        "Vector Databases",
        "Prompt Engineering",
        "Tool Calling",
        "GenAI Applications",
      ],
    },

    {
      title: "Testing & Quality",
      icon: ShieldCheck,
      tech: [
        "JUnit",
        "Mockito",
        "MockMvc",
        "Integration Testing",
        "Testcontainers",
        "API Testing",
        "Postman",
      ],
    },

    {
      title: "Tools & Workflow",
      icon: Code2,
      tech: [
        "Git",
        "GitHub",
        "IntelliJ IDEA",
        "VS Code",
        "DBeaver",
        "Swagger",
        "REST Client",
        "Agile Development",
      ],
    },
  ];

  return (
    <section className="py-20">
      <div className="mb-12">
        <span
          className="
            inline-flex
            items-center
            px-4
            py-2
            rounded-full
            bg-blue-50
            text-blue-700
            text-sm
            font-medium
            mb-5
          "
        >
          Technologies I Work With
        </span>

        <h2
          className="
            text-4xl
            md:text-5xl
            font-black
            tracking-tight
            mb-5
          "
        >
          My Tech Stack
        </h2>

        <p
          className="
            text-zinc-600
            text-lg
            max-w-3xl
          "
        >
          Technologies, frameworks, databases,
          cloud platforms, testing tools and
          engineering practices I use to build
          scalable production-ready applications.
        </p>
      </div>

      {/* Stats */}

      {/* <div
        className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-4
          mb-10
        "
      >
        {[
          {
            value: "60+",
            label: "Technologies",
          },
          {
            value: "5+",
            label: "Major Projects",
          },
          {
            value: "Java",
            label: "Core Expertise",
          },
          {
            value: "Backend",
            label: "Primary Focus",
          },
        ].map((item) => (
          <motion.div
            key={item.label}
            whileHover={{
              y: -4,
            }}
            className="
              rounded-2xl
              border
              border-zinc-200
              bg-white
              p-5
              shadow-sm
            "
          >
            <h3 className="text-3xl font-bold">
              {item.value}
            </h3>

            <p className="text-zinc-500 text-sm mt-1">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div> */}

      {/* Tech Categories */}

      <div
        className="
          grid
          md:grid-cols-2
          gap-6
        "
      >
        {groups.map((group) => {
          const Icon = group.icon;

          return (
            <motion.div
              key={group.title}
              whileHover={{
                y: -5,
                scale: 1.01,
              }}
              className="
                rounded-3xl
                border
                border-zinc-200
                bg-white
                p-6
                shadow-sm
                hover:shadow-xl
                transition-all
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                  mb-5
                "
              >
                <div
                  className="
                    h-12
                    w-12
                    rounded-xl
                    bg-blue-50
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Icon
                    size={22}
                    className="text-blue-600"
                  />
                </div>

                <h3
                  className="
                    text-xl
                    font-bold
                  "
                >
                  {group.title}
                </h3>
              </div>

              <div className="flex flex-wrap gap-3">
                {group.tech.map((tech) => (
                  <TechBadge key={tech}>
                    {tech}
                  </TechBadge>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default TechStack;