import PageWrapper from "../components/common/PageWrapper";

// import ContactCard from "../components/contact/ContactCard";
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
        <div className="mb-16">
          <p className="text-blue-600 font-medium mb-2">
            Contact
          </p>

          <h1 className="text-5xl font-bold mb-6">
            Let's Connect
          </h1>

          <p className="max-w-3xl text-zinc-600">
            I'm always interested in discussing
            backend development, software
            engineering, open-source projects,
            and career opportunities.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="border rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">
              Current Status
            </h2>

            <div className="space-y-4">
              <p>📍 Kolkata, India</p>

              <p>🎓 MCA Student</p>

              <p>☕ Backend-Focused Java Developer</p>

              <p>🚀 Open to Entry-Level Opportunities</p>
            </div>

            <a
              href={siteConfig.resume}
              className="
                inline-block
                mt-8
                px-5
                py-3
                rounded-xl
                bg-blue-600
                text-white
              "
            >
              Download Resume
            </a>
          </div>

          <ContactForm />
        </div>
      </PageWrapper>
    </>
  );
}

export default Contact;