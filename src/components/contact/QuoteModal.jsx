import { useEffect, useRef } from "react";

import { createPortal } from "react-dom";

import { motion } from "framer-motion";

import { X } from "lucide-react";

import ContactForm from "./ContactForm";

function QuoteModal({
  open,
  onClose,
  productName,
}) {
  const formRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    formRef.current
      ?.querySelector(
        'input[name="name"]'
      )
      ?.focus();

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleEsc
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEsc
      );
    };
  }, [open, onClose]);

  if (!open) return null;

  const initialMessage =
    `Hey, I want to get a free quote for ${productName}. ` +
    `Please share pricing, timelines and any customization options available.`;

  return createPortal(
    <div
      className="
        fixed
        inset-0
        z-[100]
        bg-black/40
        backdrop-blur-sm
        overflow-y-auto
        px-4
        py-8
      "
      onClick={onClose}
    >
      <div
        className="
          min-h-full
          flex
          items-center
          justify-center
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
          onClick={(e) =>
            e.stopPropagation()
          }
          role="dialog"
          aria-modal="true"
          aria-label={`Free quote for ${productName}`}
          className="
            w-full
            max-w-xl
            rounded-3xl
            border
            border-zinc-200
            bg-white
            dark:border-zinc-700
            dark:bg-zinc-800
            shadow-2xl
            overflow-hidden
            my-auto
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              px-8
              py-6
              border-b
              border-zinc-200
              dark:border-zinc-700
            "
          >
            <div>
              <h2 className="text-2xl font-bold text-[#fbbf24]">
                Get a Free Quote
              </h2>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                for {productName}
              </p>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="
                shrink-0
                p-2
                rounded-xl
                text-zinc-500
                dark:text-zinc-400
                hover:bg-zinc-100
                dark:hover:bg-zinc-700
                transition
              "
            >
              <X size={20} />
            </button>
          </div>

          <div
            ref={formRef}
            className="p-8"
          >
            <ContactForm
              key={productName}
              variant="bare"
              submitLabel="Request Quote"
              initialMessage={initialMessage}
              extraFields={{
                product: productName,
                subject: `Free quote request — ${productName}`,
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>,
    document.body
  );
}

export default QuoteModal;