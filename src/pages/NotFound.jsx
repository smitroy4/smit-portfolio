import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

import SEO from "../components/common/SEO";

function NotFound() {
  return (
    <>
      <SEO
        title="404 Not Found"
        description="The requested page could not be found."
      />

      <section
        className="
          relative
          min-h-[75vh]
          flex
          items-center
          justify-center
          overflow-hidden
        "
      >
        {/* Grid Background */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.03]
            pointer-events-none
            bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)]
            bg-[size:60px_60px]
          "
        />

        <div className="relative text-center max-w-3xl mx-auto px-6">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="
              inline-flex
              items-center
              gap-3
              rounded-full
              border
              border-amber-200
              bg-amber-50
              px-4
              py-2
              mb-8
            "
          >
            <span className="relative flex h-3 w-3">
              <span
                className="
                  animate-ping
                  absolute
                  inline-flex
                  h-full
                  w-full
                  rounded-full
                  bg-amber-500
                  opacity-75
                "
              />

              <span
                className="
                  relative
                  inline-flex
                  rounded-full
                  h-3
                  w-3
                  bg-amber-500
                "
              />
            </span>

            <span className="text-sm font-medium text-amber-700">
              Route Not Found
            </span>
          </motion.div>

          {/* 404 */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="
              text-8xl
              md:text-[10rem]
              lg:text-[12rem]
              font-black
              leading-none
              tracking-tight
              mb-4
            "
          >
            <span
              className="
                bg-gradient-to-r
                from-blue-600
                to-cyan-500
                bg-clip-text
                text-transparent
              "
            >
              404
            </span>
          </motion.h1>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="
              text-3xl
              md:text-5xl
              font-bold
              tracking-tight
              mb-6
            "
          >
            Looks Like This Route
            <br />
            Doesn't Exist
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="
              text-lg
              md:text-xl
              text-zinc-600 dark:text-zinc-400
              leading-relaxed
              max-w-2xl
              mx-auto
              mb-10
            "
          >
            The page you're looking for may have been moved,
            renamed, or never existed in the first place.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="
              flex
              flex-wrap
              justify-center
              gap-4
            "
          >
            <Link
              to="/"
              className="
                inline-flex
                items-center
                gap-2
                rounded-2xl
                bg-zinc-900
                px-6
                py-3
                text-white
                font-medium
                transition-all
                duration-300
                hover:bg-zinc-800
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              <Home size={18} />
              Go Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="
                inline-flex
                items-center
                gap-2
                rounded-2xl
                border
                border-zinc-300 dark:border-zinc-600
                bg-white dark:bg-zinc-800
                px-6
                py-3
                font-medium
                transition-all
                duration-300
                hover:border-zinc-900 dark:hover:border-zinc-400
                hover:-translate-y-1
                hover:shadow-lg dark:hover:shadow-zinc-900/50
              "
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </motion.div>

        </div>
      </section>
    </>
  );
}

export default NotFound;