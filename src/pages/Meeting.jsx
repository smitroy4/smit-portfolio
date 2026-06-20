import { motion } from "framer-motion";
import { InlineWidget } from "react-calendly";

import PageWrapper from "../components/common/PageWrapper";
import SEO from "../components/common/SEO";

function Meeting() {
  return (
    <>
      <SEO
        title="Book a Meeting"
        description="Schedule a 30-minute meeting with Smit Roy to discuss backend development, software engineering, projects, collaborations, and opportunities."
      />

      <PageWrapper>

        {/* Hero */}
        <section className="relative mb-20 overflow-hidden">

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

          <div className="relative">

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
                Available for Meetings
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="
                text-4xl
                md:text-5xl
                lg:text-6xl
                font-black
                tracking-tight
                leading-[0.95]
                mb-8
              "
            >
              Schedule A

              <span
                className="
                  block
                  bg-gradient-to-r
                  from-blue-600
                  to-cyan-500
                  bg-clip-text
                  text-transparent
                "
              >
                30-Minute Meeting
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="
                text-lg
                md:text-xl
                text-zinc-600
                leading-relaxed
                max-w-3xl
              "
            >
              Whether you'd like to discuss backend
              development, software engineering, projects,
              collaborations, career opportunities, or simply
              connect, feel free to book a convenient time.
            </motion.p>

          </div>
        </section>

        {/* Calendly */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="
            rounded-3xl
            border
            border-zinc-200
            bg-white
            overflow-hidden
            shadow-sm
          "
        >
          <InlineWidget
            url="https://calendly.com/smitroy/30min"
            styles={{
              height: "830px",
            }}
          />
        </motion.div>

      </PageWrapper>
    </>
  );
}

export default Meeting;