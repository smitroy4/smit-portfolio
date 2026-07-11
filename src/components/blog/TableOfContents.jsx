import { useEffect, useState } from "react";

function TableOfContents() {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const headingElements = Array.from(
      document.querySelectorAll(".blog-content h2, .blog-content h3"),
    );

    const items = headingElements
      .filter((heading) => heading.id)
      .map((heading) => ({
        id: heading.id,
        text: heading.textContent,
        level: heading.tagName,
      }));

    setHeadings(items);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);

        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
      },
    );

    headingElements.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, []);

  if (!headings.length) {
    return null;
  }

  const handleClick = (e, id) => {
    e.preventDefault();

    const element = document.getElementById(id);

    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <aside
      className="
        hidden
        xl:block
        w-80
      "
    >
      <div
        className="
          sticky
          top-6

          max-h-[calc(100vh-3rem)]

          overflow-hidden

          rounded-2xl
          border
          border-zinc-200
          bg-white

          flex
          flex-col
        "
      >
        <div
          className="
            px-5
            py-4
            border-b
            border-zinc-200
          "
        >
          <h3
            className="
              text-xs
              uppercase
              tracking-wider
              font-bold
              text-zinc-900
            "
          >
            Table of Contents
          </h3>
        </div>

        <div
          className="
    flex-1
    overflow-y-auto
    p-4
    pb-24
  "
        >
          <ul className="space-y-1">
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={heading.level === "H3" ? "ml-4" : ""}
              >
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => handleClick(e, heading.id)}
                  className={`
                    block
                    rounded-lg
                    px-3
                    py-2
                    text-sm
                    transition-all

                    ${
                      activeId === heading.id
                        ? `
                          bg-blue-50
                          text-blue-700
                          font-semibold
                        `
                        : `
                          text-zinc-600
                          hover:bg-zinc-50
                          hover:text-blue-600
                        `
                    }
                  `}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default TableOfContents;
