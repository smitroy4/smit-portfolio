import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2 } from "lucide-react";

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
    }, 2200);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={handleClick}
          initial={{
            opacity: 0,
            scale: 0.5,
            y: 60,
          }}
          animate={
            launching
              ? {
                  y: -1800,
                  opacity: 0,
                  scale: 0.4,
                  x: [0, -2, 3, -1, 2, 0],
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
            y: -20,
          }}
          transition={{
            type: launching ? "tween" : "spring",
            stiffness: launching ? undefined : 300,
            damping: launching ? undefined : 15,
            mass: launching ? undefined : 0.8,
            duration: launching ? 2.0 : 0.5,
            ease: launching ? [0.55, 0.06, 0.68, 0.19] : "easeOut",
            x: launching ? { duration: 0.4, ease: "easeInOut" } : undefined,
          }}
          whileHover={
            !launching
              ? {
                  y: -6,
                  scale: 1.08,
                  boxShadow: "0 20px 60px rgba(59,130,246,0.3)",
                  transition: { type: "spring", stiffness: 400, damping: 10 },
                }
              : {}
          }
          whileTap={
            !launching
              ? { scale: 0.9, y: 4 }
              : {}
          }
          className="
            group
            fixed
            bottom-6
            right-6
            z-50
            h-14
            w-14
            rounded-full
            bg-zinc-900
            text-white
            shadow-[0_10px_30px_rgba(0,0,0,0.25)]
            flex
            items-center
            justify-center
            cursor-pointer
            overflow-visible
          "
        >
          {!launching && (
            <motion.div
              animate={{
                y: [0, -5, 0],
                rotate: [0, -10, 12, -5, 0],
                scale: [1, 1.06, 0.98, 1.02, 1],
              }}
              transition={{
                y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <Code2
                size={24}
                strokeWidth={2.5}
                className="
                  transition-all
                  duration-300
                  group-hover:scale-110
                  group-hover:-translate-y-1
                "
              />
            </motion.div>
          )}

          {launching && (
            <>
              <Code2 size={24} strokeWidth={2.5} />

              {/* Flame cone - outer */}
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{
                  scaleY: [0, 1.8, 1.2, 0.6],
                  opacity: [0, 1, 0.8, 0],
                  y: [0, 20, 45, 70],
                }}
                transition={{
                  duration: 0.9,
                  ease: "easeOut",
                }}
                className="
                  absolute
                  bottom-0
                  left-1/2
                  -translate-x-1/2
                  w-5
                  h-8
                  origin-top
                  rounded-b-full
                  bg-gradient-to-b
                  from-orange-500
                  via-yellow-400
                  to-transparent
                  blur-sm
                  pointer-events-none
                "
              />

              {/* Flame cone - inner */}
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{
                  scaleY: [0, 1.5, 1, 0.4],
                  opacity: [0, 1, 0.6, 0],
                  y: [0, 15, 35, 60],
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.05,
                  ease: "easeOut",
                }}
                className="
                  absolute
                  bottom-0
                  left-1/2
                  -translate-x-1/2
                  w-3
                  h-6
                  origin-top
                  rounded-b-full
                  bg-gradient-to-b
                  from-blue-200
                  via-white
                  to-transparent
                  blur-sm
                  pointer-events-none
                "
              />

              {/* Exhaust ring */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 2.5, 4],
                  opacity: [0, 0.6, 0],
                  y: [0, 10, 40],
                }}
                transition={{
                  duration: 1.0,
                  delay: 0.15,
                  ease: "easeOut",
                }}
                className="
                  absolute
                  bottom-[-4px]
                  left-1/2
                  -translate-x-1/2
                  w-8
                  h-2
                  rounded-full
                  bg-orange-400/60
                  blur-md
                  pointer-events-none
                "
              />
            </>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default ScrollToTopButton;