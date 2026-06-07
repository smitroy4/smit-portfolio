import { Download } from "lucide-react";

import {
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";

import siteConfig from "../../data/siteConfig";

import Button from "../common/Button";

function Hero() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-4xl">
        <p className="text-blue-600 font-medium mb-4">
          Hello, I'm {siteConfig.name}
        </p>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          {siteConfig.title}
        </h1>

        <p className="text-xl text-zinc-500 leading-relaxed mb-10">
          {siteConfig.intro}
        </p>

        <div className="flex flex-wrap gap-4">
          <Button href={siteConfig.resume}>
            <Download size={18} className="mr-2" />
            Resume
          </Button>

          <Button
            href={siteConfig.github}
            variant="secondary"
          >
            <FaGithub className="mr-2" />
            GitHub
          </Button>

          <Button
            href={siteConfig.linkedin}
            variant="secondary"
          >
            <FaLinkedin className="mr-2" />
            LinkedIn
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Hero;