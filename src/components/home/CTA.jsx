import siteConfig from "../../data/siteConfig";

function CTA() {
  return (
    <section className="py-20 text-center">
      <h2 className="text-4xl font-bold mb-4">
        Let's Build Something Great
      </h2>

      <p className="text-zinc-500 mb-8">
        Open to opportunities, collaboration,
        and exciting projects.
      </p>

      <a
        href="https://calendly.com/smitroy/30min"
        target="_blank"
        className="inline-flex px-6 py-3 rounded-lg bg-zinc-900 text-white"
      >
        Schedule a Meeting
      </a>
    </section>
  );
}

export default CTA;