const resources = [
  {
    category: "Spring Boot Interview Questions",
    subtitle: "by CoddingShuttle - Anuj Kumar Sharma",

    sections: [
      {
        title: "Spring & Backend Development",

        items: [
          {
            title: "Module 1 - Spring Framework",
            slug: "module-1-spring-framework",
            description:
              "Core Spring Framework concepts including IoC, Dependency Injection, Bean Lifecycle, and Spring Architecture.",
            category: "Spring",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961891/Module_1_-_Spring_Framework_h6gd9r.pdf"
          },

          {
            title: "Module 2 - Spring Boot Web MVC",
            slug: "module-2-spring-boot-web-mvc",
            description:
              "Building REST APIs, Controllers, Request Mapping, Validation, and MVC architecture using Spring Boot.",
            category: "Spring Boot",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961891/Module_2_-_Spring_Boot_Web_MVC_qwmksl.pdf"
          },

          {
            title: "Module 3 - Spring Data JPA",
            slug: "module-3-spring-data-jpa",
            description:
              "Persistence, Repositories, Entity Mapping, JPQL, Hibernate, and database interaction.",
            category: "Database",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961892/Module_3_-_Spring_Data_JPA_xnqaca.pdf"
          },

          {
            title: "Module 4 - Spring Boot Production",
            slug: "module-4-spring-boot-production",
            description:
              "Production-ready Spring Boot applications, monitoring, logging, configuration, and best practices.",
            category: "Production",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961891/Module_4_-_Spring_Boot_Production_dkzaub.pdf"
          },

          {
            title: "Module 5 & 6 - Spring Security",
            slug: "module-5-6-spring-security",
            description:
              "Authentication, Authorization, JWT, OAuth2, Role-Based Access Control, and Security Best Practices.",
            category: "Security",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961892/Module_5_6_-_Spring_Security_pkpbf2.pdf"
          },

          {
            title: "Module 7 - Spring Boot Testing",
            slug: "module-7-spring-boot-testing",
            description:
              "Unit Testing, Integration Testing, MockMvc, Mockito, JUnit, and Testcontainers.",
            category: "Testing",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961891/Module_7_-_Spring_Boot_Testing_zcltey.pdf#"
          },

          {
            title: "Module 8 - Spring Boot Deployment",
            slug: "module-8-spring-boot-deployment",
            description:
              "Deploying Spring Boot applications using Docker, Cloud Platforms, and CI/CD pipelines.",
            category: "Deployment",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961892/Module_8_-_Spring_Boot_Deployment_aypsc5.pdf"
          },

          {
            title: "Module 9 - GenAI, Spring AI & RAG",
            slug: "module-9-genai-spring-ai-rag",
            description:
              "Generative AI, Spring AI, Retrieval Augmented Generation, Vector Databases, and LLM Integration.",
            category: "AI",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961892/Module_9_-_GenAI_Spring_AI_RAG_tzm4py.pdf"
          },

          {
            title: "Module 10 - Aspect Oriented Programming",
            slug: "module-10-aop",
            description:
              "Cross-cutting concerns, AOP concepts, Pointcuts, Advices, and AspectJ integration.",
            category: "AOP",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961892/Module_10_-_Aspect_Oriented_Programming_pw6yrn.pdf"
          },

          {
            title: "Module 11 - Caching & Transaction Management",
            slug: "module-11-caching-transaction-management",
            description:
              "Spring Cache, Transaction Propagation, Isolation Levels, and Distributed Transactions.",
            category: "Performance",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961892/Module_11_-_Caching_and_Transaction_Mgt._n5dakb.pdf"
          }
        ]
      },

      {
        title: "Microservices & Distributed Systems",

        items: [
          {
            title: "Module 12 - Microservices Architecture",
            slug: "module-12-microservices-architecture",
            description:
              "Microservices fundamentals, Service Discovery, API Gateway, Resilience, and Communication Patterns.",
            category: "Microservices",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961892/Module_12_-_Microservices_Architecture_sccx3d.pdf"
          },

          {
            title: "Module 13 - Advanced Microservices",
            slug: "module-13-advanced-microservices",
            description:
              "Distributed Systems, Event-Driven Architecture, Observability, and Scalability Patterns.",
            category: "Microservices",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961893/Module_13_-_Advanced_Microservices_edrcsi.pdf"
          },

          {
            title: "Module 14 - Apache Kafka",
            slug: "module-14-apache-kafka",
            description:
              "Kafka Architecture, Topics, Partitions, Consumer Groups, Event Streaming, and Messaging Systems.",
            category: "Kafka",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961893/Module_14_-_Apache_Kafka_aluq02.pdf"
          }
        ]
      },

      {
        title: "DevOps & Cloud",

        items: [
          {
            title: "Module 15 - Docker for Backend",
            slug: "module-15-docker-for-backend",
            description:
              "Containerization, Docker Images, Volumes, Networking, and Backend Application Deployment.",
            category: "Docker",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961895/Module_15_-_Docker_for_Backend_ygvmff.pdf"
          },

          {
            title: "Module 16 - Kubernetes Components",
            slug: "module-16-kubernetes-components",
            description:
              "Pods, Deployments, Services, ConfigMaps, Secrets, and Kubernetes Architecture.",
            category: "Kubernetes",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961896/Module_16_-_Kubernetes_Components_oqpdkf.pdf"
          },

          {
            title: "Module 17 - Google Kubernetes Engine",
            slug: "module-17-google-kubernetes-engine",
            description:
              "Deploying and managing Kubernetes workloads on Google Cloud Platform using GKE.",
            category: "Cloud",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961896/Module_17_-_Google_Kubernetes_Engine_yrfkj6.pdf"
          }
        ]
      },

      {
        title: "Java Advanced",

        items: [
          {
            title: "Module 18 - Java Multithreading & Spring Async",
            slug: "module-18-java-multithreading-spring-async",
            description:
              "Concurrency, Thread Pools, CompletableFuture, Virtual Threads, and Asynchronous Programming.",
            category: "Java",
            link: "https://res.cloudinary.com/dv5g9pqe4/image/upload/v1781961896/Module_18_-_Java_Multithreading_Spring_Boot_Async_lsx66u.pdf"
          }
        ]
      }
    ]
  }
];

export default resources;