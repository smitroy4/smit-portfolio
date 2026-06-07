import { useState } from "react";

function ContactForm() {
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setStatus("Sending...");

    const formData = new FormData(e.target);

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
      e.target.reset();
    } else {
      setStatus("Failed to send message.");
    }
  }

  return (
    <div className="border rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-6">
        Send a Message
      </h2>

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
          "
        />

        <textarea
          name="message"
          rows="6"
          placeholder="Your Message"
          required
          className="
            w-full
            border
            rounded-xl
            px-4
            py-3
          "
        />

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
          Send Message
        </button>

        {status && (
          <p className="text-sm mt-2">
            {status}
          </p>
        )}
      </form>
    </div>
  );
}

export default ContactForm;