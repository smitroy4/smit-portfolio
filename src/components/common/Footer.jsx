import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

import siteConfig from "../../data/siteConfig";

function Footer() {
  return (
    <footer className="mt-32 border-t border-zinc-200 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid lg:grid-cols-3 gap-14">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/smit-roy-portfolio-favicon.png"
                alt="Smit Roy"
                className="h-14 w-14"
              />

              <div>
                <h3 className="text-2xl font-bold">
                  {siteConfig.name}
                </h3>

                <p className="text-zinc-500 text-sm">
                  Thinking in Systems
                </p>
              </div>
            </div>

            <p className="text-zinc-600 leading-relaxed max-w-sm">
              Backend Developer focused on Java,
              Spring Boot, Microservices, System Design,
              and building scalable cloud-native applications.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-5">
              Quick Links
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <a
                href="/"
                className="text-zinc-600 hover:text-zinc-900"
              >
                Home
              </a>

              <a
                href="/about"
                className="text-zinc-600 hover:text-zinc-900"
              >
                About
              </a>

              <a
                href="/projects"
                className="text-zinc-600 hover:text-zinc-900"
              >
                Projects
              </a>

              <a
                href="/blogs"
                className="text-zinc-600 hover:text-zinc-900"
              >
                Blogs
              </a>

              <a
                href="/resources"
                className="text-zinc-600 hover:text-zinc-900"
              >
                Resources
              </a>

              <a
                href="/contact"
                className="text-zinc-600 hover:text-zinc-900"
              >
                Contact
              </a>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-lg mb-5">
              Let's Build Something Together
            </h4>

            <p className="text-zinc-600 mb-6">
              Open to collaborations, freelance work,
              backend engineering discussions, and
              interesting opportunities.
            </p>

            <div className="flex flex-wrap gap-3">

              
              <a
                href={siteConfig.linkedin}
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-zinc-300
                  bg-white
                  hover:border-zinc-900
                  transition
                "
              >
                <FaLinkedin />
                LinkedIn
              </a>

              <a
                href={siteConfig.github}
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-zinc-300
                  bg-white
                  hover:border-zinc-900
                  transition
                "
              >
                <FaGithub />
                GitHub
              </a>

              <a
                href={`mailto:${siteConfig.email}`}
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-zinc-300
                  bg-white
                  hover:border-zinc-900
                  transition
                "
              >
                <FaEnvelope />
                Email
              </a>

            </div>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-zinc-200">

          <div className="flex flex-col md:flex-row justify-between gap-4">

            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} Smit Roy.
              All rights reserved.
            </p>

            <p className="text-sm text-zinc-500">
              Built with React, Tailwind CSS & Vite.
            </p>

          </div>

        </div>

      </div>
    </footer>
  );
}

export default Footer;