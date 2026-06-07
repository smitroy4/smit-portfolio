import PageWrapper from "../components/common/PageWrapper";

import AboutHero from "../components/about/AboutHero";
import SkillsSection from "../components/about/SkillsSection";
import TimelineSection from "../components/about/TimelineSection";
// import FutureGoals from "../components/about/FutureGoals";

function About() {
  return (
    <PageWrapper>
      <AboutHero />

      <SkillsSection />

      <TimelineSection />

      {/* <FutureGoals /> */}
    </PageWrapper>
  );
}

export default About;