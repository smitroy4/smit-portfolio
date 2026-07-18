import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home";
import About from "../pages/About";
import Projects from "../pages/Projects";
import Blogs from "../pages/Blogs";
import BlogPost from "../pages/BlogPost";
import Resources from "../pages/Resources";
import ResourceCollectionPage from "../pages/ResourceCollectionPage";
import Contact from "../pages/Contact";
import Meeting from "../pages/Meeting";
import ResourceViewer from "../pages/ResourceViewer";
import Hack4j from "../pages/Hack4j";
import NotFound from "../pages/NotFound";

// import AIChat from "../components/AIChat";

function AppRoutes() {
  const location = useLocation();

  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />

          <Route path="/about" element={<About />} />

          <Route path="/projects" element={<Projects />} />

          <Route path="/blogs" element={<Blogs />} />

          <Route path="/blogs/:slug" element={<BlogPost />} />

          <Route path="/resources" element={<Resources />} />

          <Route
            path="/resources/collection/:slug"
            element={<ResourceCollectionPage />}
          />

          <Route
            path="/resources/:slug"
            element={<ResourceViewer />}
          />

          <Route path="/contact" element={<Contact />} />

          <Route path="/hack4j" element={<Hack4j />} />

          <Route path="/meeting" element={<Meeting />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      {/* <AIChat /> */}
    </MainLayout>
  );
}

export default AppRoutes;