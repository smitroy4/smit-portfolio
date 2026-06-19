import PageWrapper from "../components/common/PageWrapper";

import AboutHero from "../components/about/AboutHero";
import SkillsSection from "../components/about/SkillsSection";
import TimelineSection from "../components/about/TimelineSection";
// import FutureGoals from "../components/about/FutureGoals";

import SEO from "../components/common/SEO";

function About() {
  return (
    <>
      <SEO
        title="About"
        description="Learn about Smit Roy's journey into software engineering, backend development, Java, Spring Boot, Microservices, System Design, and distributed systems."
      />

      <PageWrapper>
        <AboutHero />

        <SkillsSection />

        <TimelineSection />

        {/* <FutureGoals /> */}
      </PageWrapper>
    </>
  );
}

export default About;