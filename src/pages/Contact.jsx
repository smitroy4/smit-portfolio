import { motion } from "framer-motion";
import {
  MapPin,
  GraduationCap,
  Coffee,
  Rocket,
  Download,
} from "lucide-react";

import PageWrapper from "../components/common/PageWrapper";
import ContactForm from "../components/contact/ContactForm";

import siteConfig from "../data/siteConfig";

import SEO from "../components/common/SEO";

function Contact() {
  return (
    <>
      <SEO
        title="Contact"
        description="Connect with Smit Roy for backend development opportunities, collaborations, software engineering discussions, and open-source projects."
      />

      <PageWrapper>

        {/* Hero */}
        <section className="relative mb-24 overflow-hidden">

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
                border-zinc-200
                bg-white
                dark:border-zinc-700
                dark:bg-zinc-800
                px-4
                py-2
                mb-8
                shadow-sm
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
                    bg-blue-500
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
                    bg-blue-500
                  "
                />
              </span>

              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Open for Opportunities
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
              Let's

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
                Connect
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
                text-zinc-600 dark:text-zinc-400
                leading-relaxed
                max-w-3xl
                mb-12
              "
            >
              I'm always interested in discussing backend
              development, software engineering, distributed
              systems, open-source projects, and exciting
              career opportunities.
            </motion.p>

            {/* Status Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="
                grid
                grid-cols-2
                md:grid-cols-4
                gap-5
                max-w-5xl
              "
            >
              <div
                className="
                  rounded-2xl
                  border
                  border-zinc-200 dark:border-zinc-700
                  bg-white dark:bg-zinc-800
                  p-5
                  shadow-sm
                "
              >
                <MapPin size={22} className="mb-3" />

                <h3 className="font-semibold">
                  Kolkata
                </h3>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Remote | Onsite, India
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-zinc-200 dark:border-zinc-700
                  bg-white dark:bg-zinc-800
                  p-5
                  shadow-sm
                "
              >
                <GraduationCap size={22} className="mb-3" />

                <h3 className="font-semibold">
                  MCA
                </h3>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Cloud Computing | 2027'
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-zinc-200 dark:border-zinc-700
                  bg-white dark:bg-zinc-800
                  p-5
                  shadow-sm
                "
              >
                <Coffee size={22} className="mb-3" />

                <h3 className="font-semibold">
                  Java
                </h3>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Backend Heavy Full-Stack
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-zinc-200 dark:border-zinc-700
                  bg-white dark:bg-zinc-800
                  p-5
                  shadow-sm
                "
              >
                <Rocket size={22} className="mb-3" />

                <h3 className="font-semibold">
                  Open To Work
                </h3>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Backend Roles | OS Projects
                </p>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Contact Section */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Left Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="
              rounded-3xl
              border
              border-zinc-200 dark:border-zinc-700
              bg-white dark:bg-zinc-800
              p-8
              shadow-sm
            "
          >
            <h2 className="text-3xl font-bold mb-4">
              Current Status
            </h2>

            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
              Currently focused on Java Backend
              Development, Microservices, System Design,
              and building production-ready applications
              while pursuing my MCA.
            </p>

            <div className="space-y-4 text-zinc-700 dark:text-zinc-400">
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-zinc-400 shrink-0" />
                Kolkata, India
              </p>

              <p className="flex items-center gap-2">
                <GraduationCap size={16} className="text-zinc-400 shrink-0" />
                MCA Student
              </p>

              <p className="flex items-center gap-2">
                <Coffee size={16} className="text-zinc-400 shrink-0" />
                Backend-Focused Java Developer
              </p>

              <p className="flex items-center gap-2">
                <Rocket size={16} className="text-zinc-400 shrink-0" />
                Open to New Opportunities
              </p>
            </div>

            <a
              href={siteConfig.resume}
              className="
                inline-flex
                items-center
                gap-2
                mt-8
                rounded-2xl
                bg-zinc-900
                px-5
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
              <Download size={18} />
              Download Resume
            </a>
          </motion.div>

          {/* Contact Form */}
          <ContactForm />

        </div>

      </PageWrapper>
    </>
  );
}

export default Contact;