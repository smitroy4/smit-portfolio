import { useState } from "react";

function ContactForm({
  title = "Send a Message",
  submitLabel = "Send Message",
  initialMessage = "",
  extraFields = {},
  variant = "card",
  onSuccess,
}) {
  const [status, setStatus] = useState("");
  const [message, setMessage] =
    useState(initialMessage);

  async function handleSubmit(e) {
    e.preventDefault();

    setStatus("Sending...");

    const formData = new FormData(e.target);

    formData.set(
      "message",
      message
    );

    formData.append(
      "access_key",
      import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
    );

    const response = await fetch(
      "https://api.web3forms.com/submit",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (result.success) {
      setStatus("Message sent successfully!");
      setMessage("");
      e.target.reset();

      onSuccess?.();
    } else {
      setStatus("Failed to send message.");
    }
  }

  const form = (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        type="text"
        name="name"
        placeholder="Your Name"
        required
        className="
          w-full
          border
          rounded-xl
          px-4
          py-3
          dark:border-zinc-600
          dark:bg-zinc-800
          dark:text-zinc-200
        "
      />

      <input
        type="email"
        name="email"
        placeholder="Your Email"
        required
        className="
          w-full
          border
          rounded-xl
          px-4
          py-3
          dark:border-zinc-600
          dark:bg-zinc-800
          dark:text-zinc-200
        "
      />

      <textarea
        name="message"
        rows="6"
        value={message}
        onChange={(e) =>
          setMessage(
            e.target.value
          )
        }
        placeholder="Your Message"
        required
        className="
          w-full
          border
          rounded-xl
          px-4
          py-3
          dark:border-zinc-600
          dark:bg-zinc-800
          dark:text-zinc-200
        "
      />

      {Object.entries(
        extraFields
      ).map(([name, value]) => (
        <input
          key={name}
          type="hidden"
          name={name}
          value={value}
        />
      ))}

      <button
        type="submit"
        className="
          px-5
          py-3
          rounded-xl
          bg-blue-600
          text-white
          font-medium
        "
      >
        {submitLabel}
      </button>

      {status && (
        <p className="text-sm mt-2">
          {status}
        </p>
      )}
    </form>
  );

  if (variant === "bare") {
    return form;
  }

  return (
    <div className="border rounded-2xl p-8 dark:border-zinc-700">
      <h2 className="text-2xl font-bold mb-6">
        {title}
      </h2>

      {form}
    </div>
  );
}

export default ContactForm;