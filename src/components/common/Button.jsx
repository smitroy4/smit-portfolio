function Button({
  children,
  href,
  variant = "primary",
}) {
  const styles = {
    primary:
      "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",

    secondary:
      "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center px-5 py-3 rounded-lg font-medium transition ${styles[variant]}`}
    >
      {children}
    </a>
  );
}

export default Button;