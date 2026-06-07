import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex gap-6">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/blogs">Blogs</Link>
        <Link to="/resources">Resources</Link>
        <Link to="/contact">Contact</Link>
      </div>
    </nav>
  );
}

export default Navbar;