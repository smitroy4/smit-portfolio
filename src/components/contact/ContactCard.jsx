function ContactCard({
  title,
  value,
  href,
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="
        block
        border
        rounded-2xl
        p-6
        hover:shadow-lg
        transition
      "
    >
      <p className="text-sm text-zinc-500 mb-2">
        {title}
      </p>

      <h3 className="font-semibold break-all">
        {value}
      </h3>
    </a>
  );
}

export default ContactCard;