import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ExternalLink,
  FlaskConical,
} from "lucide-react";

import PageWrapper from "../components/common/PageWrapper";
import SEO from "../components/common/SEO";
import CTA from "../components/home/CTA";

import labSections from "../data/lab";
import products from "../data/products";

const accentStyles = {
  blue: {
    tile: "bg-blue-600/10 text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-400/15 dark:text-blue-300",
  },
  amber: {
    tile: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
  },
  emerald: {
    tile: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  },
  violet: {
    tile: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    badge:
      "bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300",
  },
};

function LabCard({ section, index }) {
  const Icon = section.icon;
  const accent = accentStyles[section.accent] || accentStyles.blue;
  const isLive = section.status === "Live";

  const cardClassName = `
    group
    flex
    flex-col
    h-full
    rounded-3xl
    border
    border-zinc-200
    dark:border-zinc-700
    bg-white
    dark:bg-zinc-800
    p-8
    shadow-sm
    hover:-translate-y-1
    hover:shadow-xl
    dark:hover:shadow-zinc-900/50
    transition-all
    duration-300
  `;

  const cardBody = (
    <>
      <div className="flex items-start justify-between gap-3 mb-6">
        <span
          className={`
            flex
            items-center
            justify-center
            h-14
            w-14
            rounded-2xl
            ${accent.tile}
          `}
        >
          <Icon size={26} />
        </span>

        <span
          className={`
            shrink-0
            px-3
            py-1
            rounded-full
            text-xs
            font-medium
            ${accent.badge}
          `}
        >
          {section.status}
        </span>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
        {section.title}
      </h2>

      <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
        {section.tagline}
      </p>

      {section.topics ? (
        <ul className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2 grow content-start">
          {section.topics.map((topic) => (
            <li
              key={topic}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-zinc-100
                dark:border-zinc-700
                bg-zinc-50
                dark:bg-zinc-700/50
                px-3
                py-2.5
                text-sm
                font-medium
                text-zinc-700
                dark:text-zinc-200
              "
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              {topic}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed grow">
          {section.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-700">
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {section.meta}
        </span>

        <span className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
          {isLive ? "Explore" : "Peek inside"}
          {section.external ? (
            <ExternalLink
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          ) : (
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          )}
        </span>
      </div>
    </>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
    >
      {section.external ? (
        <a
          href={section.path}
          target="_blank"
          rel="noopener noreferrer"
          className={cardClassName}
        >
          {cardBody}
        </a>
      ) : (
        <Link to={section.path} className={cardClassName}>
          {cardBody}
        </Link>
      )}
    </motion.div>
  );
}

function Lab() {
  return (
    <>
      <SEO
        title="Lab"
        description="The Lab — Smit Roy's space for experiments: production-ready SaaS products, system design notes, and more brewing soon."
        url="https://smitroy.com/lab"
      />

      <PageWrapper>
        <section className="relative mb-16 overflow-hidden">
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
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fbbf24] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#fbbf24]" />
              </span>

              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Experiments, shipped.
              </span>
            </motion.div>

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
              The{" "}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 bg-clip-text text-transparent">
                Lab
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="
                text-lg
                md:text-xl
                text-zinc-600
                dark:text-zinc-400
                leading-relaxed
                max-w-3xl
                mb-12
              "
            >
              Everything I&apos;m building and breaking outside client work —
              production-ready SaaS products you can deploy today, plus
              system-design experiments brewing alongside them.
            </motion.p>

            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl">
              {[
                { value: labSections.length, label: "Lab Sections" },
                {
                  value: products.length,
                  label: "SaaS Products Live",
                },
                { value: "100%", label: "Plug-n-Play" },
                { value: "More", label: "Brewing Soon" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -5 }}
                  className="
                    rounded-2xl
                    border
                    border-zinc-200
                    dark:border-zinc-700
                    bg-white
                    dark:bg-zinc-800
                    p-5
                    shadow-sm
                  "
                >
                  <FlaskConical size={18} className="mb-3 text-blue-600" />
                  <h3 className="text-3xl font-bold">{item.value}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Lab sections grid */}
        <motion.div layout className="grid md:grid-cols-2 gap-8">
          {labSections.map((section, index) => (
            <LabCard key={section.id} section={section} index={index} />
          ))}
        </motion.div>

        <CTA />
      </PageWrapper>
    </>
  );
}

export default Lab;
