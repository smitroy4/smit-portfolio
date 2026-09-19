export const authorsById = {
  1: {
    id: 1,
    name: "Smit Roy",
    role: "Java Backend Developer",
    image: "/images/profile/smit-roy.webp",
    description:
      "MCA student and a Backend Developer focused on Java, Spring Boot, Microservices, System Design, Cloud-Native Development, and building scalable distributed applications.",
    linkedin: "https://linkedin.com/in/smitroy22",
    github: "https://github.com/smitroy4",
  },
  2: {
    id: 2,
    name: "Debangshi Dasgupta",
    role: "Data Analyst",
    image: "/images/debangshi-dasgupta.jpg",
    description:
      "Data Analyst skilled in transforming raw data into actionable insights — data cleaning, analysis, visualization, and storytelling from data.",
    linkedin: "https://www.linkedin.com/in/debangshi/",
    github: "https://github.com/debangshi-dasgupta",
  },
};

export function getAuthor(authorId) {
  return authorsById[authorId] || authorsById[1];
}

export default authorsById;