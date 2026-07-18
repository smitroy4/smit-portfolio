import {
FaJava,
FaReact,
FaDocker,
FaDatabase,
FaSitemap,
FaCogs,
FaLayerGroup,
FaLock,
FaBolt,
FaCode,
FaBalanceScale,
FaServer,
FaCloud,
FaExchangeAlt,
FaCube,
FaShieldAlt,
FaGithub,
FaTrain,
} from "react-icons/fa";

const techIcons = {
Java:
"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",

"Spring Boot":
"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg",

PostgreSQL:
"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",

MySQL:
"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",

MongoDB:
"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",

Redis:
"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",

Docker:
"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",

Kubernetes:
"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",

Git:
"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",

GitHub:
"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",

React:
"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",

Tailwind:
"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",

JavaScript:
"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",

TypeScript:
"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",

Angular:
"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg",

Linux:
"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",

"Apache Kafka":
"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg",
};

const conceptIcons = {
OOP: FaCube,
"Collections Framework": FaLayerGroup,
Multithreading: FaBolt,
"Streams API": FaExchangeAlt,
JDBC: FaDatabase,
"Exception Handling": FaCode,
Concurrency: FaBolt,

"Spring MVC": FaLayerGroup,
"Spring Data JPA": FaDatabase,
"Spring Security": FaLock,
Hibernate: FaDatabase,
"JWT Authentication": FaLock,
Maven: FaCube,
"REST APIs": FaExchangeAlt,

Microservices: FaSitemap,
"API Gateway": FaExchangeAlt,
"Service Discovery": FaServer,
"Distributed Systems": FaSitemap,
"Event-Driven Architecture": FaBolt,
"Inter-Service Communication": FaExchangeAlt,
"Resilience Patterns": FaShieldAlt,

"High-Level Design": FaSitemap,
"Low-Level Design": FaCode,
"Design Patterns": FaLayerGroup,
Scalability: FaCloud,
"Caching Strategies": FaBolt,
"Database Design": FaDatabase,
"Load Balancing": FaBalanceScale,

"Asynchronous Processing": FaBolt,

"GitHub Actions": FaGithub,
"CI/CD": FaExchangeAlt,
Postman: FaExchangeAlt,
Render: FaCloud,
Railway: FaTrain,
};

const skillGroups = [
{
title: "Java Programming",
icon: FaJava,
skills: [
"Java",
"OOP",
"Collections Framework",
"Multithreading",
"Streams API",
"JDBC",
"Exception Handling",
"Concurrency",
],
},
{
title: "Spring Framework",
icon: FaLayerGroup,
skills: [
"Spring Boot",
"Spring MVC",
"Spring Data JPA",
"Spring Security",
"Hibernate",
"JWT Authentication",
"Maven",
"REST APIs",
],
},
{
title: "Microservices & Distributed Systems",
icon: FaSitemap,
skills: [
"Microservices",
"API Gateway",
"Service Discovery",
"Distributed Systems",
"Event-Driven Architecture",
"Inter-Service Communication",
"Resilience Patterns",
],
},
{
title: "System Design",
icon: FaCogs,
skills: [
"High-Level Design",
"Low-Level Design",
"Design Patterns",
"Scalability",
"Caching Strategies",
"Database Design",
"Load Balancing",
],
},
{
title: "Data & Messaging",
icon: FaDatabase,
skills: [
"PostgreSQL",
"MySQL",
"MongoDB",
"Redis",
"Apache Kafka",
"Asynchronous Processing",
],
},
{
title: "Cloud, Containers & DevOps",
icon: FaDocker,
skills: [
"Docker",
"Kubernetes",
"Git",
"GitHub",
"GitHub Actions",
"CI/CD",
"Linux",
"Postman",
"Render",
"Railway"
],
},
{
title: "Frontend Development",
icon: FaReact,
skills: [
"JavaScript",
"TypeScript",
"React",
"Angular",
],
},
];

function SkillsSection() {
return ( <section className="mb-24"> <div className="mb-14"> <p className="text-blue-600 font-medium mb-3">
Expertise </p>


    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
      Skills & Technologies
    </h2>

      <p className="max-w-3xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
      Technologies, frameworks, tools, and architectural
      concepts used to build scalable backend systems and
      production-ready applications.
    </p>
  </div>

  <div className="grid gap-8 md:grid-cols-2">
    {skillGroups.map((group) => {
      const HeaderIcon = group.icon;

      return (
        <div
          key={group.title}
          className="
              rounded-3xl
              border
              border-zinc-200
              bg-white
              dark:border-zinc-700
              dark:bg-zinc-800
              p-8
              shadow-sm
              hover:-translate-y-1
              hover:shadow-xl
              dark:hover:shadow-zinc-900/50
              transition-all
              duration-500
          "
        >
          <div className="flex items-center gap-4 mb-6">
            <div
              className="
                flex
                items-center
                justify-center
                w-12
                h-12
                rounded-2xl
                bg-blue-50
                text-blue-600
              "
            >
              <HeaderIcon size={22} />
            </div>

            <h3 className="text-xl font-semibold">
              {group.title}
            </h3>
          </div>

          <div className="flex flex-wrap gap-3">
            {group.skills.map((skill) => {
              const ConceptIcon = conceptIcons[skill];

              return (
                <span
                  key={skill}
                  className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-zinc-200
                      bg-zinc-50
                      dark:border-zinc-600
                      dark:bg-zinc-700
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-zinc-700
                      dark:text-zinc-200
                    hover:bg-blue-600
                    hover:text-white
                    hover:border-blue-600
                    transition-all
                    duration-300
                  "
                >
                  {techIcons[skill] ? (
                    <img
                      src={techIcons[skill]}
                      alt={skill}
                      className="w-4 h-4 object-contain"
                    />
                  ) : ConceptIcon ? (
                    <ConceptIcon size={14} />
                  ) : null}

                  {skill}
                </span>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
</section>


);
}

export default SkillsSection;
