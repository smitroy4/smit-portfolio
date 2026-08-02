import { useRef } from "react";
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
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";

import TechBadge from "../common/TechBadge";

function TechStack() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
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
        "JavaScript",
        "TypeScript",
        "React",
        "Angular",
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
            dark:bg-blue-900/50
            dark:text-blue-300
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
            dark:text-zinc-400
            text-lg
            max-w-3xl
          "
        >
          Technologies, frameworks, databases, cloud platforms, testing tools
          and engineering practices I use to build scalable production-ready
          applications.
        </p>
      </div>

      <div className="relative">
        <div className="mb-6 flex items-center justify-end gap-3">
          <button
            ref={prevRef}
            aria-label="Previous tech stack"
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border
              border-zinc-200
              bg-white
              text-zinc-600
              shadow-sm
              hover:border-blue-300
              hover:bg-blue-50
              hover:text-blue-600
              dark:border-zinc-700
              dark:bg-zinc-800
              dark:text-zinc-300
              dark:hover:border-blue-800
              dark:hover:bg-blue-900/40
              dark:hover:text-blue-300
              transition-all
              duration-300
            "
          >
            <ArrowLeft size={20} />
          </button>

          <button
            ref={nextRef}
            aria-label="Next tech stack"
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border
              border-zinc-200
              bg-white
              text-zinc-600
              shadow-sm
              hover:border-blue-300
              hover:bg-blue-50
              hover:text-blue-600
              dark:border-zinc-700
              dark:bg-zinc-800
              dark:text-zinc-300
              dark:hover:border-blue-800
              dark:hover:bg-blue-900/40
              dark:hover:text-blue-300
              transition-all
              duration-300
            "
          >
            <ArrowRight size={20} />
          </button>
        </div>

        <Swiper
          modules={[Navigation, Autoplay]}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
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
          className="w-full"
        >
          {groups.map((group) => {
            const Icon = group.icon;

            return (
              <SwiperSlide key={group.title} className="h-auto">
                <motion.div
                  className="
                    rounded-3xl
                    border
                    border-zinc-200
                    bg-white
                    dark:border-zinc-700
                    dark:bg-zinc-800
                    p-6
                    shadow-sm
                    hover:border-blue-200
                    dark:hover:border-blue-800
                    hover:shadow-md
                    dark:hover:shadow-zinc-900/30
                    transition-all
                    duration-300
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
                      <Icon size={22} className="text-blue-600" />
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
                      <TechBadge key={tech}>{tech}</TechBadge>
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
