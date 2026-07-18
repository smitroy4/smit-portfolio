import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import ScrollToTopButton from "../components/common/ScrollToTopButton";
import AIFloatingButton from "../components/common/AIFloatingButton";

import { useTheme } from "../components/common/ThemeWrapper";

function MainLayout({ children }) {
  const { theme } = useTheme();
  const location = useLocation();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    setNavigating(true);
    const timer = setTimeout(() => setNavigating(false), 600);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme === "light"
  ? `
      bg-gradient-to-b
      from-white
      via-white
      to-blue-50/40
      text-zinc-900
    `
   : "bg-gradient-to-b from-[#0B0E14] via-[#111827] to-[#0B0E14] text-zinc-100"
      }`}
    >
      {/* Page transition indicator */}
      <AnimatePresence>
        {navigating && (
          <motion.div
            initial={{ scaleX: 0, transformOrigin: "left" }}
            animate={{ scaleX: 1, transformOrigin: "left" }}
            exit={{ scaleX: 0, transformOrigin: "right" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 z-50"
          />
        )}
      </AnimatePresence>

      {/* Decorative Blur Effects */}
      {theme === "light" ? (
        <>
          <div
            className="
              fixed
              top-0
              left-0
              w-[500px]
              h-[500px]
              rounded-full
              bg-blue-100/30
              blur-3xl
              pointer-events-none
              -z-10
            "
          />

          <div
            className="
              fixed
              bottom-0
              right-0
              w-[500px]
              h-[500px]
              rounded-full
              bg-sky-100/30
              blur-3xl
              pointer-events-none
              -z-10
            "
          />
        </>
      ) : (
        <>
          <div
            className="
              fixed
              top-[-200px]
              left-[-200px]
              w-[700px]
              h-[700px]
              rounded-full
              bg-blue-600/10
              blur-3xl
              pointer-events-none
              -z-10
            "
          />

          <div
            className="
              fixed
              bottom-[-200px]
              right-[-200px]
              w-[700px]
              h-[700px]
              rounded-full
              bg-indigo-600/10
              blur-3xl
              pointer-events-none
              -z-10
            "
          />

          <div
            className="
              fixed
              top-1/2
              right-1/4
              -translate-y-1/2
              w-[500px]
              h-[500px]
              rounded-full
              bg-cyan-500/5
              blur-3xl
              pointer-events-none
              -z-10
            "
          />
        </>
      )}

      <Navbar />

      <main className="flex-1">{children}</main>

      <Footer />

      {/* Rocket Scroll To Top */}
      <ScrollToTopButton />

      {/* Hack4j AI Floating Chat */}
      <AIFloatingButton />
    </div>
  );
}

export default MainLayout;
