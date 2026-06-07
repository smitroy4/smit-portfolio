function AboutHero() {
  return (
    <section className="mb-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div>
          <p className="text-blue-600 font-medium mb-3">
            About Me
          </p>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
            Building Systems That Scales
          </h1>

          <div className="space-y-6 text-zinc-600 leading-relaxed">
            <p>
              I'm Smit Roy an MCA student and a
              Backend Developer focused on Java,
              Spring Boot, Microservices, System
              Design, and scalable software
              engineering.
            </p>

            <p>
              My journey into technology started from
              a finance background and gradually
              evolved into software development
              through self-learning, practical
              projects, and continuous improvement.
            </p>

            <p>
              Today I spend most of my time learning
              backend development, distributed
              systems, databases, cloud-native
              development, and modern software
              architecture.
            </p>

            <p>
              My long-term goal is to become a highly
              skilled Java Backend Developer capable
              of designing reliable, scalable, and
              production-ready applications.
            </p>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex justify-center lg:justify-end">
          <img
            src="/images/profile/smit-roy.webp"
            alt="Smit-Roy"
            className="
              w-72
              h-72
              md:w-96
              md:h-96
              object-contain
              rounded-3xl
              border
              shadow-lg
            "
          />
        </div>

      </div>
    </section>
  );
}

export default AboutHero;