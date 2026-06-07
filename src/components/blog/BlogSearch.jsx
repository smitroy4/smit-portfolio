function BlogSearch({
  value,
  onChange,
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      placeholder="Search articles..."
      className="
        w-full
        md:w-96
        border
        rounded-xl
        px-4
        py-3
      "
    />
  );
}

export default BlogSearch;