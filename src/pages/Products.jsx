import { motion } from "framer-motion";

import {
  Boxes,
  Filter,
  Package,
  Sparkles,
} from "lucide-react";

import PageWrapper from "../components/common/PageWrapper";
import ProductCard from "../components/cards/ProductCard";
import SEO from "../components/common/SEO";
import CTA from "../components/home/CTA";

import products from "../data/products";

function Products() {
  const liveCount =
    products.filter(
      (product) =>
        product.status === "Live"
    ).length;

  return (
    <>
      <SEO
        title="SaaS Products"
        description="Production-ready SaaS products built by Smit Roy — plug-and-play platforms you can deploy on day one and customize to your business needs."
        url="https://smitroy.com/products"
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
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
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
                Deploy It. Then Make It Yours.
              </span>
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
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
              SaaS
              <br />

              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-[#fbbf24] bg-clip-text text-transparent">
                Products
              </span>
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
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
              Complete, production-grade platforms you can stand up
              as-is. Every product ships in its default
              out-of-the-box form — plug-n-play on day one — and
              we then customize it around your business needs.
            </motion.p>

            <motion.div
              className="
                grid
                grid-cols-2
                md:grid-cols-4
                gap-5
                max-w-5xl
              "
            >
              {[
                {
                  value:
                    products.length,
                  label: "Products",
                  icon: Boxes,
                },
                {
                  value: liveCount,
                  label: "Live Now",
                  icon: Sparkles,
                },
                {
                  value: "100%",
                  label:
                    "Plug-n-Play",
                  icon: Package,
                },
                {
                  value: "Bespoke",
                  label: "Customization",
                  icon: Filter,
                },
              ].map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <motion.div
                      key={
                        item.label
                      }
                      whileHover={{
                        y: -5,
                      }}
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
                      <Icon
                        size={18}
                        className="mb-3 text-blue-600"
                      />

                      <h3 className="text-3xl font-bold">
                        {item.value}
                      </h3>

                      <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                        {item.label}
                      </p>
                    </motion.div>
                  );
                }
              )}
            </motion.div>
          </div>
        </section>

        {/* Products Grid */}

        <motion.div
          layout
          className="
            grid
            md:grid-cols-2
            gap-8
          "
        >
          {products.map(
            (product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.08,
                }}
              >
                <ProductCard
                  product={product}
                  featured={index === 0}
                />
              </motion.div>
            )
          )}
        </motion.div>

        {products.length === 0 && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="text-center py-24"
          >
            <Package
              size={48}
              className="
                mx-auto
                text-zinc-300
                dark:text-zinc-600
                mb-4
              "
            />

            <h3 className="text-2xl font-bold mb-3">
              No Products Here Yet
            </h3>

            <p className="text-zinc-500 dark:text-zinc-400">
              More products are on the way — check
              back soon.
            </p>
          </motion.div>
        )}

        <CTA />
      </PageWrapper>
    </>
  );
}

export default Products;