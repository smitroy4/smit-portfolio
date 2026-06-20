import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Menu,
  X,
} from "lucide-react";

import Container from "./Container";
import { useTheme } from "./ThemeWrapper";

function Navbar() {
  const [open, setOpen] = useState(false);

  const { theme } = useTheme();

  const links = [
    { name: "Lobby", path: "/" },
    { name: "About", path: "/about" },
    { name: "Projects", path: "/projects" },
    { name: "Blogs", path: "/blogs" },
    { name: "Resources", path: "/resources" },
    { name: "Contact", path: "/contact" },
  ];

  const navLinkClass = ({ isActive }) =>
    isActive
      ? `
        px-4 py-2 rounded-lg
        bg-zinc-100
        text-zinc-900
        font-medium
      `
      : `
        px-4 py-2 rounded-lg
        text-zinc-600
        hover:text-zinc-900
        hover:bg-zinc-100
        transition-all
        duration-300
      `;

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
        theme === "light"
          ? "bg-white/90 border-zinc-200"
          : "bg-zinc-950/90 border-zinc-800"
      }`}
    >
      <Container className="max-w-7xl">
        <div className="h-16 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <img
              src="/smit-roy-porfolio-favicon.png"
              alt="Smit Roy"
              className="h-12 w-auto"
            />

            <div className="hidden lg:block leading-tight">
              <p
                className={`font-semibold text-sm ${
                  theme === "light"
                    ? "text-zinc-900"
                    : "text-zinc-100"
                }`}
              >
                SMIT ROY
              </p>

              <p
                className={`text-xs ${
                  theme === "light"
                    ? "text-zinc-500"
                    : "text-zinc-400"
                }`}
              >
                Thinking in Systems
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">

            <nav className="flex items-center gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={navLinkClass}
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Meeting Button */}
            <Link
              to="/meeting"
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-zinc-900
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                transition-all
                duration-300
                hover:bg-zinc-800
                hover:-translate-y-0.5
                hover:shadow-lg
              "
            >
              Schedule a Meeting
            </Link>

          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center gap-2">

            <Link
              to="/meeting"
              className="
                rounded-lg
                bg-zinc-900
                px-3
                py-2
                text-xs
                font-medium
                text-white
              "
            >
              Meet
            </Link>

            <button
              onClick={() => setOpen(!open)}
              className={
                theme === "light"
                  ? "text-zinc-700"
                  : "text-zinc-200"
              }
            >
              {open ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>

        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden pb-5">
            <div className="flex flex-col gap-2 pt-2">

              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={navLinkClass}
                >
                  {link.name}
                </NavLink>
              ))}

              <Link
                to="/meeting"
                onClick={() => setOpen(false)}
                className="
                  mt-2
                  px-4
                  py-3
                  rounded-xl
                  bg-zinc-900
                  text-white
                  text-center
                  font-medium
                "
              >
                Schedule a Meeting
              </Link>

            </div>
          </div>
        )}

      </Container>
    </header>
  );
}

export default Navbar;