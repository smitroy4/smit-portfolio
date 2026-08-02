const resourceModules = import.meta.glob(
  "../content/resources/**/*.md",
  {
    query: "?raw",
    import: "default",
  }
);

export async function loadResource(file) {
  const path = `../content/resources/${file}`;

  const importer = resourceModules[path];

  if (!importer) {
    return null;
  }

  return await importer();
}
