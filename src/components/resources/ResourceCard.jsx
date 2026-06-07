function ResourceCard({ item }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noreferrer"
      className="
        block
        border
        rounded-xl
        p-5
        hover:shadow-lg
        transition
      "
    >
      <h3 className="font-semibold text-lg mb-2">
        {item.title}
      </h3>

      <p className="text-zinc-600">
        {item.description}
      </p>
    </a>
  );
}

export default ResourceCard;