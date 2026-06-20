import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket } from "lucide-react";

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!launching) {
        setVisible(window.scrollY > 300);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, [launching]);

  const handleClick = () => {
    if (launching) return;

    setLaunching(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setTimeout(() => {
      setVisible(false);
      setLaunching(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={handleClick}
          initial={{
            opacity: 0,
            scale: 0.7,
            y: 50,
          }}
          animate={
            launching
              ? {
                  y: -1500,
                  scale: 1.15,
                  opacity: 0,
                }
              : {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }
          }
          exit={{
            opacity: 0,
            scale: 0.5,
          }}
          transition={{
            duration: launching ? 1.2 : 0.3,
            ease: "easeInOut",
          }}
          whileHover={
            !launching
              ? {
                  y: -5,
                  scale: 1.08,
                }
              : {}
          }
          className="
            fixed
            bottom-6
            right-6
            z-50
            h-14
            w-14
            rounded-full
            bg-zinc-900
            text-white
            shadow-xl
            flex
            items-center
            justify-center
            cursor-pointer
          "
        >
          <div className="relative flex items-center justify-center">

            <Rocket size={24} />

            {launching && (
              <motion.div
                className="
                  absolute
                  top-6
                  left-1/2
                  -translate-x-1/2
                  w-2
                  h-6
                  rounded-full
                  bg-orange-500
                "
                animate={{
                  scaleY: [1, 2, 1],
                  opacity: [1, 0.4, 1],
                }}
                transition={{
                  duration: 0.12,
                  repeat: Infinity,
                }}
              />
            )}

          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default ScrollToTopButton;