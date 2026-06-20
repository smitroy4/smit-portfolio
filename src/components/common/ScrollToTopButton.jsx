import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2 } from "lucide-react";

const codeParticles = [
  "public class App",
  "String name",
  "private final",
  "return data;",
  "@Service",
  "new ArrayList<>()",
  "public static",
  "System.out.println()",
  "List<User>",
  "Optional<User>",
  "@Autowired",
  "void execute()",
  "if(user != null)",
  "try { }",
  "catch(Exception e)",
];

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
    }, 2300);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={handleClick}
          initial={{
            opacity: 0,
            scale: 0.8,
            y: 40,
          }}
          animate={
            launching
              ? {
                  y: -1600,
                  opacity: 0,
                  scale: 1.05,
                }
              : {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }
          }
          exit={{
            opacity: 0,
            scale: 0.8,
          }}
          transition={{
            duration: launching ? 2.3 : 0.3,
            ease: "easeInOut",
          }}
          whileHover={
            !launching
              ? {
                  y: -4,
                  scale: 1.06,
                }
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
                y: [0, -3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Code2
                size={24}
                strokeWidth={2.5}
                className="
                  transition-transform
                  duration-300
                  group-hover:rotate-12
                "
              />
            </motion.div>
          )}

          {launching && (
            <>
              <Code2
                size={24}
                strokeWidth={2.5}
              />

              {Array.from({ length: 40 }).map(
                (_, index) => (
                  <motion.span
                    key={index}
                    className="
                      absolute
                      text-[10px]
                      font-mono
                      font-semibold
                      text-black
                      whitespace-nowrap
                      pointer-events-none
                    "
                    initial={{
                      opacity: 1,
                      x: 0,
                      y: 0,
                    }}
                    animate={{
                      opacity: 0,
                      y: 250 + index * 40,
                      x:
                        index % 2 === 0
                          ? -40 -
                            ((index * 17) % 80)
                          : 40 +
                            ((index * 19) % 80),
                      scale: 0.8,
                    }}
                    transition={{
                      duration: 1.8,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                  >
                    {
                      codeParticles[
                        index %
                          codeParticles.length
                      ]
                    }
                  </motion.span>
                )
              )}
            </>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default ScrollToTopButton;