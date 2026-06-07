function TechBadge({ children }) {
  return (
    <span className="px-4 py-2 rounded-full border border-zinc-300 text-sm font-medium">
      {children}
    </span>
  );
}

export default TechBadge;