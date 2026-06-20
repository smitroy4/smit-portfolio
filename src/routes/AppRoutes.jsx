import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home";
import About from "../pages/About";
import Projects from "../pages/Projects";
import Blogs from "../pages/Blogs";
import BlogPost from "../pages/BlogPost";
import Resources from "../pages/Resources";
import Contact from "../pages/Contact";
import Meeting from "../pages/Meeting";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/projects" element={<Projects />} />

        <Route path="/blogs" element={<Blogs />} />

        <Route
          path="/blogs/:slug"
          element={<BlogPost />}
        />

        <Route
          path="/resources"
          element={<Resources />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/meeting"
          element={<Meeting />}
        />

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </MainLayout>
  );
}

export default AppRoutes;