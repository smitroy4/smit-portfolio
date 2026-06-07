const skillGroups = [
  {
    title: "Java Programming",
    skills: [
      "Java",
      "OOP",
      "Collections Framework",
      "Multithreading",
      "Streams API",
      "JDBC",
      "Exception Handling",
      "Concurrency"
    ],
  },

  {
    title: "Spring Framework",
    skills: [
      "Spring Boot",
      "Spring MVC",
      "Spring Data JPA",
      "Spring Security",
      "Hibernate",
      "JWT Authentication",
      "Maven",
      "REST APIs"
    ],
  },

  {
    title: "Microservices & Distributed Systems",
    skills: [
      "Microservices",
      "API Gateway",
      "Service Discovery",
      "Distributed Systems",
      "Event-Driven Architecture",
      "Inter-Service Communication",
      "Resilience Patterns"
    ],
  },

  {
    title: "System Design",
    skills: [
      "High-Level Design",
      "Low-Level Design",
      "Design Patterns",
      "Scalability",
      "Caching Strategies",
      "Database Design",
      "Load Balancing"
    ],
  },

  {
    title: "Data & Messaging",
    skills: [
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "Redis",
      "Apache Kafka",
      "Asynchronous Processing"
    ],
  },

  {
    title: "Cloud, Containers & DevOps",
    skills: [
      "Docker",
      "Kubernetes",
      "Git",
      "GitHub",
      "GitHub Actions",
      "CI/CD",
      "Linux",
      "Postman",
      "Render"
    ],
  },

  {
    title: "Frontend (Supporting Skills)",
    skills: [
      "JavaScript",
      "React"
    ],
  },
];

function SkillsSection() {
  return (
    <section className="mb-20">
      <h2 className="mb-10 text-3xl font-bold">
        Skills & Technologies
      </h2>

      <div className="grid gap-8 md:grid-cols-2">
        {skillGroups.map((group) => (
          <div
            key={group.title}
            className="rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="mb-4 text-lg font-semibold">
              {group.title}
            </h3>

            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border px-3 py-1 text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SkillsSection;