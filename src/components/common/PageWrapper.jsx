import { motion } from "framer-motion";

function PageWrapper({ children }) {
  return (
    <motion.main
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
      }}
      className="
        max-w-7xl
        mx-auto
        px-6
        py-10
      "
    >
      {children}
    </motion.main>
  );
}

export default PageWrapper;