import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

function CTA() {
  return (
    <section className="pt-12 pb-4">

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="
          relative
          overflow-hidden
          rounded-[40px]
          bg-zinc-950
          px-8
          py-16
          md:px-16
          md:py-20
          text-center
        "
      >

        {/* Glow Effects */}
        <div
          className="
            absolute
            -top-32
            -left-32
            h-72
            w-72
            rounded-full
            bg-blue-500/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-32
            -right-32
            h-72
            w-72
            rounded-full
            bg-cyan-500/20
            blur-3xl
          "
        />

        <div className="relative z-10">

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
              border-emerald-200
              bg-emerald-50
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
                  bg-emerald-500
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
                  bg-emerald-500
                "
              />
            </span>

            <span className="text-sm font-medium text-emerald-700">
              Open to Opportunities
            </span>
          </motion.div>

          <h2
            className="
              text-4xl
              md:text-6xl
              font-black
              tracking-tight
              text-white
              mb-6
            "
          >
            Let's Build Something
            <br />

            <span
              className="
                bg-gradient-to-r
                from-blue-400
                to-cyan-400
                bg-clip-text
                text-transparent
              "
            >
              Great Together
            </span>
          </h2>

          <p
            className="
              max-w-2xl
              mx-auto
              text-lg
              md:text-xl
              text-zinc-400
              leading-relaxed
              mb-10
            "
          >
            Whether you're hiring, building a product,
            discussing backend architecture, or exploring
            collaboration opportunities, I'd love to connect.
          </p>

          <div
            className="
              flex
              flex-col
              sm:flex-row
              justify-center
              gap-4
            "
          >
            <Link
              to="/meeting"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-white
                px-6
                py-3
                font-semibold
                text-zinc-900
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-2xl
              "
            >
              <CalendarDays size={18} />
              Schedule a Meeting
            </Link>

            <Link
              to="/contact"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-zinc-700
                bg-zinc-900
                px-6
                py-3
                font-semibold
                text-white
                transition-all
                duration-300
                hover:bg-zinc-800
              "
            >
              Contact Me
              <ArrowRight size={18} />
            </Link>
          </div>

        </div>

      </motion.div>

    </section>
  );
}

export default CTA;