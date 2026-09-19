const projects = [

{
  id: "eclat-ai",
  title: "EclatAI",
  category: "AI Web Builder",
  featured: true,
  status: "In Development",
  banner: "/images/projects/eclat-ai-cover.png",
  description:
    "EclatAI is a production-focused AI web builder that generates clean, deployable React frontends developers actually want to work with. Built on Generative AI + RAG for intelligent code generation, powered by Spring Boot, Qdrant, PostgreSQL, and Kubernetes.",
  technologies: [
    "Java",
    "Spring Boot",
    "Microservices",
    "Gen AI",
    "RAG",
    "PostgreSQL",
    "Qdrant",
    "Kubernetes",
  ],
  github: "https://github.com/smitroy4/EclatAI",
  demo: null,
  highlights: [
    "Intelligent React code generation leveraging Gemini API with RAG",
    "Cloud-native deployment architecture for scalability",
    "Vector database for semantic understanding of design patterns",
    "GCP integration for managed infrastructure and ML services",
    "MVP launch planned for Q1 2027",
  ],
  docs: [
    {
      title: "Getting Started",
      content: `
Clone the repository and install dependencies to get started.

- Prerequisites: Java 17+, Node 20+, PostgreSQL, and a Gemini API key
- Set the required environment variables for database and API credentials
- Run the backend locally, then start the frontend dev server
`,
    },
    {
      title: "Architecture",
      content: `
Overview of how the system is structured.

- Spring Boot services orchestrate the generation pipeline
- RAG layer with Qdrant for semantic retrieval of design patterns
- Kubernetes used for cloud-native deployment and scaling
`,
    },
    {
      title: "API Reference",
      content: `
Endpoints exposed by the backend.

- POST /api/generate — generates a React frontend from a prompt
- GET /api/templates — lists available design templates
- POST /api/deploy — deploys a generated frontend to the cloud
`,
    },
    {
      title: "Roadmap",
      content: `
- Q1 2027: MVP launch
- Q2 2027: Multi-user workspaces and shared projects
- Q3 2027: Analytics and usage insights
`,
    },
  ]
},

    {
    id: "staygrid",

    title: "StayGrid",

    category: "Backend System",

    featured: true,

    status: "Completed",

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

    demo: "https://staygrid-b02y.onrender.com/api/v1/",

    highlights: [
      "JWT auth with refresh tokens in HttpOnly cookies",
      "Pessimistic locking to prevent overbooking on concurrent requests",
      "Stripe Checkout with webhook-driven payment confirmation",
      "Strategy Pattern dynamic pricing across 5 composable layers",
      "Scheduled hourly job for automated price optimization",
"Full booking lifecycle with auto-expiry on unpaid reservations"
  ],
  docs: [
    {
      title: "Getting Started",
      content: `
Clone the repository and run the application locally.

- Prerequisites: Java 17+, PostgreSQL, Redis, and a Stripe test key
- Configure application properties for the database and Redis connection
- Run migrations, then start the Spring Boot application
`,
    },
    {
      title: "Architecture",
      content: `
Overview of how the system is structured.

- Monolithic Spring Boot application with clear layered modules
- JWT authentication with refresh tokens in HttpOnly cookies
- Redis caching for hot data and optimistic reads
- Stripe Checkout drives payment flow via webhooks
`,
    },
    {
      title: "API Reference",
      content: `
Endpoints exposed by the backend.

- POST /api/v1/auth/register — create a user account
- GET /api/v1/hotels — list available hotels
- POST /api/v1/bookings — create a booking
- GET /api/v1/bookings — list the current user's bookings
`,
    },
    {
      title: "Deployment",
      content: `
How the service is deployed.

- PostgreSQL and Redis provisioned as managed services
- Deployed on Render with environment-based configuration
- Scheduled job runs hourly for automated price optimization
`,
    },
  ]
},
  
  {
    id: "circuit-mart",

    title: "CircuitMart",

    category: "Backend System",

    featured: true,

    status: "Completed",

    banner: "/images/projects/circuit-mart-cover.png",

    description:
      "CircuitMart is a cloud-native e-commerce backend built with Spring Boot Microservices, API gateway routing, centralized configuration, fault tolerance, distributed tracing, and centralized logging.",

    technologies: [
      "Java",
      "Spring Boot",
      "Spring Cloud",
      "Eureka",
      "Kafka",
      "Resilience4J",
      "Zipkin",
    ],

    github:
      "https://github.com/smitroy4/CircuitMart",

    demo: null,

    highlights: [
      "5-service microservices with Eureka discovery & Config Server",
      "Sync (OpenFeign) + Async (Kafka) inter-service communication",
      "Resilience4J circuit breaker on Feign calls",
      "JWT validated at API Gateway — stateless downstream services",
"Distributed tracing via Micrometer + Zipkin across HTTP, Feign, Kafka",
  ],
  docs: [
    {
      title: "Getting Started",
      content: `
Clone the repository and start the infrastructure.

- Prerequisites: Java 17+, Docker, and the required services in docker-compose
- Start Eureka, Config Server, and the five core services
- Reach the gateway and explore the microservices
`,
    },
    {
      title: "Architecture",
      content: `
Overview of the microservice topology.

- 5-service architecture with Eureka discovery and centralized config
- API Gateway validates JWTs, keeping downstream services stateless
- Synchronous calls over OpenFeign, asynchronous events over Kafka
- Resilience4J circuit breakers guard Feign-based communication
`,
    },
    {
      title: "Observability",
      content: `
How the system is monitored.

- Micrometer + Zipkin for distributed tracing across HTTP, Feign, and Kafka
- Centralized logging to correlate requests across services
- Kafka topics for order and inventory event flows
`,
    },
    {
      title: "Run Locally",
      content: `
Steps to run all services together.

- docker compose up for infrastructure dependencies
- Start Config Server first, then Eureka, then gateway and services
- Import the included Postman collection to exercise endpoints
`,
    },
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
  ],
  docs: [
    {
      title: "Getting Started",
      content: `
Add the starter as a dependency and configure it in minutes.

- Add the starter to your Maven or Gradle build
- Configure issuer, secrets, and token lifetimes in application.properties
- Annotate endpoints to protect them with JWT authentication
`,
    },
    {
      title: "Configuration",
      content: `
Properties exposed by the starter.

- jwt.secret — the signing secret
- jwt.access-token-ttl — access token lifetime
- jwt.refresh-token-ttl — refresh token lifetime
- jwt.issuer — token issuer claim
`,
    },
    {
      title: "Extension Points",
      content: `
How to customize behaviour.

- Override beans marked with @ConditionalOnMissingBean
- Provide your own JwtService or filter implementation
- Add claims and custom token generation logic
`,
    },
    {
      title: "Publishing",
      content: `
Distribution and release.

- JAR published to GitHub Packages
- CI/CD via GitHub Actions on every push and tag
- Versioned releases with changelog
`,
    },
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
  ],
  docs: [
    {
      title: "Getting Started",
      content: `
Clone the repository and configure the hospital domain.

- Prerequisites: Java 17+, PostgreSQL, and optional OAuth2 app credentials
- Configure Google and GitHub OAuth2 client IDs and secrets
- Run the application and access the public API endpoints
`,
    },
    {
      title: "Authentication",
      content: `
How identity and access control work.

- JWT authentication with OAuth2 social login (Google, GitHub)
- Hybrid role-based and permission-based access control
- Method-level security via @PreAuthorize and @Secured
`,
    },
    {
      title: "Domain Model",
      content: `
The core entities and their relationships.

- Hospital, Doctor, Patient, and Appointment entities
- Strict 1:1 mapping with @MapsId for Doctor and Patient
- Custom JPQL queries for aggregation and bulk operations
`,
    },
    {
      title: "Error Handling",
      content: `
How failures are surfaced to clients.

- Centralized exception handling with @RestControllerAdvice
- Consistent error response envelope across all endpoints
- Input validation errors mapped to structured messages
`,
    },
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
  ],
  docs: [
    {
      title: "Getting Started",
      content: `
Clone the repository and run the LMS backend locally.

- Prerequisites: Java 17+, PostgreSQL, and Docker
- Preloaded sample data allows instant local testing
- Start the container or run the Spring Boot app directly
`,
    },
    {
      title: "Architecture",
      content: `
Overview of the module structure.

- Layered architecture with strict Controller-Service-Repository separation
- Relational model with JPA mappings across four entities
- Enrollment flow with duplicate-enrollment prevention
`,
    },
    {
      title: "API Reference",
      content: `
Endpoints exposed by the backend.

- POST /api/students — create a student
- POST /api/courses — create a course
- POST /api/enrollments — enroll a student in a course
- GET /api/courses — list available courses
`,
    },
    {
      title: "Deployment",
      content: `
How the service is shipped.

- Containerized with Docker
- Deployed on Render with a managed PostgreSQL instance
- Environment variables control database connection settings
`,
    },
  ]
}
];

export default projects;