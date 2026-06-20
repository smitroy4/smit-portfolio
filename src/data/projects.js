const projects = [
  {
    id: "circuit-mart",

    title: "CircuitMart",

    category: "Backend System",

    featured: true,

    status: "In Progress",

    banner: "/images/projects/circuit-mart-cover.png",

    description:
      "CircuitMart is a cloud-native e-commerce backend built with Spring Boot Microservices, demonstrating service discovery, API gateway routing, centralized configuration, fault tolerance, distributed tracing, and centralized logging.",

    technologies: [
      "Java",
      "Spring Boot",
      "Microservices",
      "Spring Cloud Gateway",
      "Eureka Service",
      "PostgreSQL",
      "Resilience4J",
      "Zipkin",
      "ELK Stack",
    ],

    github:
      "https://github.com/smitroy4/CircuitMart",

    demo: null,

    highlights: [
      "Five-service microservices architecture with Eureka discovery",
      "Centralized configuration via Spring Cloud Config Server",
      "Resilient inter-service calls using OpenFeign + Resilience4J",
      "JWT-secured API Gateway with custom filters",
      "Distributed tracing and centralized logging via Zipkin and ELK"
    ]
  },


  {
    id: "jwt-spring-boot-starter",

    title: "JWT Spring Boot Starter",

    category: "Open Source",

    featured: true,

    status: "Released",

    banner: "/images/projects/jwt-spring-boot-starter.png",

    description:
      "Reusable JWT authentication starter for Spring Boot with auto-configuration, extensibility, and zero-boilerplate integration.",

    technologies: [
      "Java",
      "Spring Boot",
      "Spring Security",
      "JWT",
      "Maven",
      "GitHub Actions"
    ],

    github:
      "https://github.com/smitroy4/jwt-spring-boot-starter",

    demo: null,

    highlights: [
      "Auto-configured JwtService and security components",
      "Access and refresh token generation with type-safe claims",
      "Automatic JWT authentication filter registration",
      "Plug-and-play architecture with zero manual bean config",
      "Fully extensible via @ConditionalOnMissingBean overrides",
      "Published to GitHub Packages",
      "CI/CD via GitHub Actions"
    ]
  },

  {
    id: "staygrid",

    title: "StayGrid",

    category: "Backend System",

    featured: true,

    status: "In Progress",

    banner: "/images/projects/staygrid-cover.png",

    description:
      "Scalable hotel booking backend with JWT authentication, Redis caching, Stripe integration, dynamic pricing, and concurrency control.",

    technologies: [
      "Java",
      "Spring Boot",
      "Spring Security",
      "PostgreSQL",
      "Redis",
      "Docker"
    ],

    github:
      "https://github.com/smitroy4/StayGrid",

    demo: null,

    highlights: [
      "JWT auth with refresh tokens in HttpOnly cookies",
      "Pessimistic locking to prevent overbooking on concurrent requests",
      "Stripe Checkout with webhook-driven payment confirmation",
      "Strategy Pattern dynamic pricing across 5 composable layers",
      "Scheduled hourly job for automated price optimization",
      "Full booking lifecycle with auto-expiry on unpaid reservations"
    ]
  },

  {
    id: "clinixhub",

    title: "ClinixHub",

    category: "Backend System",

    featured: true,

    status: "Completed",

    banner: "/images/projects/clinixhub-cover.png",

    description:
      "Production-grade Hospital Management API with JWT authentication, OAuth2 login, RBAC, permissions, and advanced JPA relationships.",

    technologies: [
      "Java",
      "Spring Boot",
      "Spring Security",
      "OAuth2",
      "JWT",
      "PostgreSQL"
    ],

    github:
      "https://github.com/smitroy4/ClinixHub",

    demo: null,

    highlights: [
      "JWT authentication with OAuth2 social login (Google, GitHub)",
      "Hybrid role-based and permission-based access control",
      "Method-level security via @PreAuthorize and @Secured",
      "Centralized exception handling with @RestControllerAdvice",
      "Custom JPQL queries for aggregation and bulk operations",
      "Strict 1:1 entity mapping with @MapsId for Doctor and Patient"
    ]
  },

  {
    id: "lms-portal",

    title: "LMS Portal",

    category: "Backend System",

    featured: true,

    status: "Completed",

    banner: "/images/projects/lms-portal-backend-cover.png",

    description:
      "Learning Management System backend supporting students, instructors, courses, enrollments, Docker deployment, and PostgreSQL.",

    technologies: [
      "Java",
      "Spring Boot",
      "PostgreSQL",
      "Docker",
      "Render"
    ],

    github:
      "https://github.com/smitroy4/LMS-Portal",

    demo:
      "https://lms-portal-backend-lug7.onrender.com/",

    highlights: [
      "Layered architecture with clean Controller-Service-Repository separation",
      "Relational data model with JPA mappings across 4 entities",
      "Enrollment system with duplicate-enrollment prevention",
      "Input validation via Jakarta annotations",
      "Preloaded sample data for instant local testing",
      "Containerized with Docker and deployed on Render with PostgreSQL"
    ]
  }
];

export default projects;