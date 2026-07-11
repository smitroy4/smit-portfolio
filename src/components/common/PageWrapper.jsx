import { motion } from "framer-motion";

function PageWrapper({ children }) {
  return (
    <main
      className="
        max-w-7xl
        mx-auto
        px-3
        py-4
        w-full
      "
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
        }}
      >
        {children}
      </motion.div>
    </main>
  );
}

export default PageWrapper;