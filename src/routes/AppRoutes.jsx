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
import ResourceViewer from "../pages/ResourceViewer";
import NotFound from "../pages/NotFound";

// import AIChat from "../components/AIChat";

function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/projects" element={<Projects />} />

        <Route path="/blogs" element={<Blogs />} />

        <Route path="/blogs/:slug" element={<BlogPost />} />

        <Route path="/resources" element={<Resources />} />

        <Route
          path="/resources/:slug"
          element={<ResourceViewer />}
        />

        <Route path="/contact" element={<Contact />} />

        <Route path="/meeting" element={<Meeting />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* <AIChat /> */}
    </MainLayout>
  );
}

export default AppRoutes;