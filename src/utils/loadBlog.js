const blogModules = import.meta.glob(
  "../content/blogs/*.md",
  {
    query: "?raw",
    import: "default",
  }
);

export async function loadBlog(slug) {
  const path = `../content/blogs/${slug}.md`;

  const importer = blogModules[path];

  if (!importer) {
    return null;
  }

  return await importer();
}