import { useEffect, useRef, useState } from "react";
import { Code2 } from "lucide-react";

function CustomCursor() {
  const cursorRef = useRef(null);
  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const pos = { x: -100, y: -100 };

    const move = () => {
      if (!cursorRef.current) return;
      cursorRef.current.style.transform = `translate3d(${pos.x - 20}px, ${pos.y - 20}px, 0)`;
    };

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      setHidden(false);
      move();
    };

    const onOver = (e) => {
      const interactive = e.target?.closest?.(
        'a, button, input, textarea, select, label, summary, [role="button"], [role="tab"]'
      );
      setActive(Boolean(interactive));
    };

    const onLeave = (e) => {
      if (e.relatedTarget === null) setHidden(true);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", move, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", move);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="
        fixed
        top-0
        left-0
        z-[99999]
        pointer-events-none
        transition-opacity
        duration-200
      "
      style={{ opacity: hidden ? 0 : 1 }}
    >
      <span
        className={`
          flex
          items-center
          justify-center
          w-10
          h-10
          rounded-full
          text-zinc-900
          dark:text-zinc-50
          drop-shadow-lg
          transition-transform
          duration-300
          ease-out
          ${active ? "scale-110 rotate-[135deg]" : "scale-100 rotate-0"}
        `}
      >
        <Code2 size={24} strokeWidth={2.5} />
      </span>
    </div>
  );
}

export default CustomCursor;