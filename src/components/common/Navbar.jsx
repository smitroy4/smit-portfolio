import { useState } from "react";

import { Link, NavLink } from "react-router-dom";

import {
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";

import Container from "./Container";

import { useTheme } from "./ThemeWrapper";

function Navbar() {
  const [open, setOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();

  const links = [
    { name: "About", path: "/about" },
    { name: "Projects", path: "/projects" },
    { name: "Blogs", path: "/blogs" },
    { name: "Resources", path: "/resources" },
    { name: "Contact", path: "/contact" },
  ];

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-blue-600 font-medium"
      : "hover:text-blue-600";

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur border-b ${
        theme === "light"
          ? "bg-white/80 border-zinc-200"
          : "bg-zinc-950/80 border-zinc-800"
      }`}
    >
      <Container>
        <div className="h-16 flex items-center justify-between">
          <Link
            to="/"
            className="font-bold text-lg"
          >
            Smit Roy
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={navLinkClass}
              >
                {link.name}
              </NavLink>
            ))}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border"
            >
              {theme === "light" ? (
                <Moon size={18} />
              ) : (
                <Sun size={18} />
              )}
            </button>
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === "light" ? (
                <Moon size={18} />
              ) : (
                <Sun size={18} />
              )}
            </button>

            <button
              onClick={() => setOpen(!open)}
            >
              {open ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-4">
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
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}

export default Navbar;