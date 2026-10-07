import projects from "./projects";
import products from "./products";
import blogMetadata from "./blogMetadata";
import resources from "./resources";

const resourceItems = resources.flatMap(
  (collection) =>
    collection.sections.flatMap(
      (section) =>
        section.items.map((item) => ({
          type: "resource",
          title: item.title,
          description: item.description,
          category: item.category,
          url: `/resources/${item.slug}`,
        }))
    )
);

const projectItems = projects.map(
  (project) => ({
    type: "project",
    title: project.title,
    description: project.description,
    keywords: project.technologies.join(" "),
    url: "/projects",
  })
);

const blogItems = blogMetadata.map(
  (blog) => ({
    type: "blog",
    title: blog.title,
    description: blog.description,
    keywords: blog.tags.join(" "),
    url: `/blogs/${blog.slug}`,
  })
);

const productItems = products.map(
  (product) => ({
    type: "product",
    title: product.name,
    description: product.tagline,
    keywords:
      product.technologies.join(
        " "
      ),
    url: "/lab/saas-products",
  })
);

const labItems = [
  {
    type: "lab",
    title: "Lab",
    description:
      "Experiments — SaaS products, system design notes, and more.",
    keywords: "lab experiments saas system whispering",
    url: "/lab",
  },
  {
    type: "lab",
    title: "SaaS Products",
    description:
      "Production-ready SaaS products — plug-and-play platforms you can deploy on day one.",
    keywords: "saas products plug play deploy",
    url: "/lab/saas-products",
  },
  {
    type: "lab",
    title: "System Whispering",
    description:
      "Data Structures & Algorithms, System Design, The Backend Craft, AI & ML.",
    keywords: "system whispering dsa algorithms system design backend ai ml",
    url: "https://systemswhispering.smitroy.com/",
  },
];

const searchIndex = [
  ...blogItems,
  ...projectItems,
  ...productItems,
  ...labItems,
  ...resourceItems,
];

export default searchIndex;