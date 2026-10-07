import { useState } from "react";

import {
  ExternalLink,
  Info,
  Package,
} from "lucide-react";

import { FaGithub } from "react-icons/fa";

import QuoteModal from "../contact/QuoteModal";

const statusStyles = {
  Live: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",

  Beta: "bg-blue-100 text-blue-800 dark:bg-blue-400/15 dark:text-blue-300",

  "In Development":
    "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",

  "Coming Soon":
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
};

function ProductCover({ product }) {
  const [failed, setFailed] =
    useState(false);

  const hasCover =
    product.cover && !failed;

  if (hasCover) {
    return (
      <img
        src={product.cover}
        alt={`${product.name} cover`}
        onError={() =>
          setFailed(true)
        }
        className="
          w-full
          aspect-video
          object-cover
          transition-transform
          duration-700
          group-hover:scale-105
        "
      />
    );
  }

  return (
    <div
      className="
        relative
        w-full
        aspect-video
        flex
        flex-col
        items-center
        justify-center
        gap-2
        bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)]
        bg-[size:28px_28px]
        dark:bg-[#0B0E14]
        bg-zinc-50
        overflow-hidden
      "
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-400/10" />

      <Package
        size={40}
        className="
          relative
          text-blue-600/40
          dark:text-blue-400/30
        "
      />

      <p
        className="
          relative
          text-xs
          font-semibold
          tracking-wide
          text-zinc-400
          dark:text-zinc-600
        "
      >
        Cover image coming soon
      </p>

      <span
        className="
          relative
          text-sm
          font-black
          text-zinc-300
          dark:text-zinc-700
        "
      >
        {product.name}
      </span>
    </div>
  );
}

function ProductCard({
  product,
  featured = false,
}) {
  const [quoteOpen, setQuoteOpen] =
    useState(false);

  return (
    <article
      id={product.id}
      className={`
        group
        flex
        flex-col
        bg-white
        dark:bg-zinc-800
        border
        rounded-3xl
        overflow-hidden
        shadow-sm
        hover:-translate-y-1
        hover:shadow-xl
        dark:hover:shadow-zinc-900/50
        transition-all
        duration-300
        ${
          featured
            ? "border-blue-500/40 ring-1 ring-blue-500/20"
            : "border-zinc-200 dark:border-zinc-700"
        }
      `}
    >
      <div className="relative overflow-hidden">
        <ProductCover product={product} />

        {featured && (
          <span
            className="
              absolute
              top-4
              left-4
              px-3
              py-1
              rounded-full
              bg-blue-600
              text-white
              text-xs
              font-semibold
              shadow-lg
            "
          >
            Flagship Product
          </span>
        )}
      </div>

      <div className="flex flex-col grow p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3
            className="
              text-2xl
              font-bold
              tracking-tight
              group-hover:text-blue-600
              transition-colors
            "
          >
            {product.name}
          </h3>

          <span
            className={`
              shrink-0
              px-3
              py-1
              rounded-full
              text-xs
              font-medium
              ${
                statusStyles[
                  product.status
                ] ||
                "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
              }
            `}
          >
            {product.status}
          </span>
        </div>

        <p className="text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
          {product.tagline}
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
          {product.description}
        </p>

        {/* Out-of-the-box version + customization notes */}

        {product.notes?.map(
          (note) => (
            <div
              key={note.title}
              className="
                flex
                gap-3
                p-4
                mb-4
                rounded-2xl
                border
                border-[#fbbf40]/40
                bg-amber-50
                dark:bg-amber-500/10
                dark:border-amber-500/20
              "
            >
              <Info
                size={18}
                className="
                  shrink-0
                  mt-0.5
                  text-amber-600
                  dark:text-amber-400
                "
              />

              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-0.5">
                  {note.title}
                </p>

                <p
                  className="
                    text-sm
                    text-amber-900/80
                    dark:text-amber-200/80
                    leading-relaxed
                  "
                >
                  {note.text}
                </p>
              </div>
            </div>
          )
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {product.technologies.map(
            (tech) => (
              <span
                key={tech}
                className="
                  px-3
                  py-1
                  rounded-full
                  bg-zinc-100
                  dark:bg-zinc-700
                  text-zinc-700
                  dark:text-zinc-300
                  text-xs
                  font-medium
                "
              >
                {tech}
              </span>
            )
          )}
        </div>

        <ul className="space-y-2 grow">
          {product.features.map(
            (item) => (
              <li
                key={item}
                className="
                  text-sm
                  text-zinc-600
                  dark:text-zinc-400
                  flex
                  gap-2
                "
              >
                <span className="text-[#fbbf24] mt-[2px]">
                  •
                </span>

                <span>
                  {item}
                </span>
              </li>
            )
          )}
        </ul>

        {product.facts && (
          <div
            className="
              grid
              sm:grid-cols-2
              gap-3
              mt-6
              pt-6
              border-t
              border-zinc-100
              dark:border-zinc-700
            "
          >
            {product.facts.map(
              (fact) => (
                <div
                  key={fact.label}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {fact.label}
                  </p>

                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-0.5">
                    {fact.value}
                  </p>
                </div>
              )
            )}
          </div>
        )}

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-3
            mt-6
            pt-6
            border-t
            border-zinc-100
            dark:border-zinc-700
          "
        >
          {product.demo && (
            <a
              href={
                product.demo
              }
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex
                items-center
                gap-2
                px-5
                py-2.5
                rounded-xl
                bg-blue-600
                text-white
                text-sm
                font-medium
                hover:bg-blue-700
                hover:-translate-y-0.5
                transition
              "
            >
              <ExternalLink size={16} />

              <span>
                Live Demo
              </span>
            </a>
          )}

          {product.repo && (
            <a
              href={product.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex
                items-center
                gap-2
                px-5
                py-2.5
                rounded-xl
                border
                border-zinc-200
                dark:border-zinc-600
                dark:text-zinc-300
                text-sm
                font-medium
                hover:bg-zinc-50
                dark:hover:bg-zinc-700
                transition
              "
            >
              <FaGithub size={16} />

              <span>
                Source
              </span>
            </a>
          )}

          <button
            type="button"
            onClick={() =>
              setQuoteOpen(true)
            }
            className="
              flex
              items-center
              gap-2
              px-5
              py-2.5
              rounded-xl
              bg-[#fbbf24]
              text-zinc-900
              text-sm
              font-medium
              hover:bg-amber-400
              hover:-translate-y-0.5
              transition
            "
          >
            Get Free Quote
          </button>
        </div>
      </div>

      <QuoteModal
        open={quoteOpen}
        onClose={() =>
          setQuoteOpen(false)
        }
        productName={product.name}
      />
    </article>
  );
}

export default ProductCard;