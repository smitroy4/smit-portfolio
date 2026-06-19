import { Download } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

import siteConfig from "../../data/siteConfig";
import Button from "../common/Button";

function Hero() {
return ( <section className="py-24 md:py-32"> <div className="max-w-5xl"> <p className="text-blue-600 font-semibold tracking-wide uppercase mb-5">
Thinking in Systems </p>

    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none mb-8">
      Building Reliable &
      <br />
      Scalable Systems
    </h1>

    <p className="text-xl md:text-2xl text-zinc-500 leading-relaxed mb-10 max-w-3xl">
      Java Backend Developer focused on Spring Boot,
      Microservices, PostgreSQL, Redis, Kafka,
      System Design, and production-ready software.
    </p>

    <div className="flex flex-wrap gap-4 mb-14">
      <Button href={siteConfig.resume}>
        <Download size={18} className="mr-2" />
        Resume
      </Button>

      <Button href={siteConfig.github} variant="secondary">
        <FaGithub className="mr-2" />
        GitHub
      </Button>

      <Button href={siteConfig.linkedin} variant="secondary">
        <FaLinkedin className="mr-2" />
        LinkedIn
      </Button>
    </div>

    <div className="grid grid-cols-3 gap-8 max-w-xl">
      <div>
        <h3 className="text-3xl font-bold">4+</h3>
        <p className="text-zinc-500 text-sm">Projects</p>
      </div>

      <div>
        <h3 className="text-3xl font-bold">10+</h3>
        <p className="text-zinc-500 text-sm">Technologies</p>
      </div>

      <div>
        <h3 className="text-3xl font-bold">2026</h3>
        <p className="text-zinc-500 text-sm">MCA Journey</p>
      </div>
    </div>
  </div>
</section>


);
}

export default Hero;
