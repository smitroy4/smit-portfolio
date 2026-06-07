import PageWrapper from "../components/common/PageWrapper";

import Hero from "../components/home/Hero";
import TechStack from "../components/home/TechStack";
import FeaturedProjects from "../components/home/FeaturedProjects";
import CTA from "../components/home/CTA";

function Home() {
  return (
    <PageWrapper>
      <Hero />

      <TechStack />

      <FeaturedProjects />

      <CTA />
    </PageWrapper>
  );
}

export default Home;