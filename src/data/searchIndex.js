import projects from "./projects";
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

const searchIndex = [
  ...blogItems,
  ...projectItems,
  ...resourceItems,
];

export default searchIndex;