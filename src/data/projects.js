const projects = [
  {
    id: "jwt-spring-boot-starter",

    title: "JWT Spring Boot Starter",

    category: "Open Source",

    featured: true,

    status: "Released v1.0.2",

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
      "Plug-and-play architecture",
      "Published package",
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
      "Stripe",
      "Docker"
    ],

    github:
      "https://github.com/smitroy4/StayGrid",

    demo: null,

    highlights: [
      "Role-based access control",
      "Booking conflict prevention",
      "Redis caching",
      "Dynamic pricing engine",
      "Stripe payments",
      "Pessimistic locking"
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
      "OAuth2 Google Login",
      "Role + Permission Model",
      "Method-level Security",
      "Advanced JPA Mappings",
      "Centralized Exception Handling"
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
      "Enrollment Management",
      "Relational Database Design",
      "Dockerized Deployment",
      "Global Exception Handling"
    ]
  }
];

export default projects;