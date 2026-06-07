import PageWrapper from "../components/common/PageWrapper";

import resources from "../data/resources";

import ResourceCard from "../components/resources/ResourceCard";

function Resources() {
  return (
    <PageWrapper>
      <div className="mb-16">
        <p className="text-blue-600 font-medium mb-2">
          Resources
        </p>

        <h1 className="text-5xl font-bold mb-6">
          Learning Resources
        </h1>

        <p className="max-w-3xl text-zinc-600">
          A collection of notes, guides,
          references, and learning material
          that I use throughout my software
          development journey.
        </p>
      </div>

      <div className="space-y-16">
        {resources.map((section) => (
          <section key={section.category}>
            <h2 className="text-3xl font-bold mb-6">
              {section.category}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item) => (
                <ResourceCard
                  key={item.title}
                  item={item}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageWrapper>
  );
}

export default Resources;