import PageWrapper from "../components/common/PageWrapper";

import Hero from "../components/home/Hero";
import TechStack from "../components/home/TechStack";
import FeaturedProjects from "../components/home/FeaturedProjects";
import CTA from "../components/home/CTA";

import SEO from "../components/common/SEO";

function Home() {
  return (
    <>
      <SEO
        title="Scaling The Stack"
        description="Smit Roy is a Java Backend Developer focused on Spring Boot, Microservices, PostgreSQL, Redis, Kafka, System Design, and scalable backend architecture."
      />

      <PageWrapper>
        <Hero />

        <TechStack />

        <FeaturedProjects />

        <CTA />
      </PageWrapper>
    </>
  );
}

export default Home;