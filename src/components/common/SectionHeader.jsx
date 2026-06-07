function SectionHeader({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="mb-12">
      {eyebrow && (
        <p className="text-sm font-medium text-blue-600 mb-2">
          {eyebrow}
        </p>
      )}

      <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
        {title}
      </h2>

      {description && (
        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;