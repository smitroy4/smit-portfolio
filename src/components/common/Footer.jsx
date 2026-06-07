import { FaGithub, FaLinkedin } from "react-icons/fa";

import siteConfig from "../../data/siteConfig";

function Footer() {
  return (
    <footer
      className="
        mt-24
        border-t
        border-zinc-200
        dark:border-slate-700
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          py-12
        "
      >
        <div
          className="
            grid
            md:grid-cols-3
            gap-10
          "
        >
          {/* Brand */}

          <div>
            <h3 className="text-xl font-bold mb-3">
              {siteConfig.name}
            </h3>

            <p
              className="
                text-zinc-600
                dark:text-zinc-300
                leading-relaxed
              "
            >
              Backend-Focused Java Developer
              building scalable systems with
              Spring Boot, PostgreSQL, Redis,
              Kafka, and modern cloud-native
              technologies.
            </p>
          </div>

          {/* Quick Links */}

          <div>
            <h4 className="font-semibold mb-4">
              Quick Links
            </h4>

            <ul className="space-y-2">
              <li>
                <a href="/">Home</a>
              </li>

              <li>
                <a href="/about">About</a>
              </li>

              <li>
                <a href="/projects">Projects</a>
              </li>

              <li>
                <a href="/blogs">Blogs</a>
              </li>
            </ul>
          </div>

          {/* Socials */}

          <div>
            <h4 className="font-semibold mb-4">
              Connect
            </h4>

            <div className="flex gap-4 mb-4">
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noreferrer"
              >
                <FaGithub size={22} />
              </a>

              <a
                href={siteConfig.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                <FaLinkedin size={22} />
              </a>
            </div>

            <p
              className="
                text-zinc-600
                dark:text-zinc-300
              "
            >
              {siteConfig.email}
            </p>
          </div>
        </div>

        <div
          className="
            border-t
            border-zinc-200
            dark:border-slate-700
            mt-10
            pt-6
            text-sm
            text-zinc-500
          "
        >
          © {new Date().getFullYear()} Smit.
          Built with React, Vite and Tailwind CSS.
        </div>
      </div>
    </footer>
  );
}

export default Footer;