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

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

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
      "Bean Validation",
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
      "Caching Strategies",
    ],
  },

  {
    title: "Microservices & Distributed Systems",
    icon: Boxes,
    tech: [
      "Microservices Architecture",
      "Spring Cloud",
      "Eureka Service Discovery",
      "OpenFeign",
      "API Gateway",
      "Resilience4j",
      "Apache Kafka",
      "Event-Driven Architecture",
      "Distributed Tracing (Zipkin)",
      "ELK Stack",
    ],
  },

  {
    title: "Testing & Quality",
    icon: ShieldCheck,
    tech: [
      "JUnit 5",
      "Mockito",
      "MockMvc",
      "Integration Testing",
      "Testcontainers",
      "Postman",
      "API Testing",
    ],
  },

  {
    title: "Cloud & DevOps",
    icon: Cloud,
    tech: [
      "Docker",
      "Kubernetes",
      "GitHub Actions",
      "CI/CD",
      "Render",
      "Linux",
      "Cloud Deployment",
    ],
  },

  {
    title: "Tools & Workflow",
    icon: Code2,
    tech: [
      "Git & GitHub",
      "IntelliJ IDEA",
      "VS Code",
      "Swagger / OpenAPI",
      "DBeaver",
      "Agile / Scrum",
    ],
  },

  {
    title: "Frontend Development",
    icon: Monitor,
    tech: [
      "React",
      "JavaScript",
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
      "LLM Integration",
      "Vector Databases",
      "Prompt Engineering",
      "Tool Calling / Function Calling",
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

      <div className="relative overflow-hidden">
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          loop={true}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
            1280: {
              slidesPerView: 3,
            },
          }}
          className="w-full pb-12"
        >
          {groups.map((group) => {
            const Icon = group.icon;

            return (
              <SwiperSlide
                key={group.title}
                className="h-auto"
              >
                <motion.div
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
                    h-full
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
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}

export default TechStack;