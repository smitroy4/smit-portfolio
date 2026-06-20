import { useEffect, useState } from "react";

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const scrollTop = window.scrollY;

      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const percentage =
        (scrollTop / documentHeight) * 100;

      setProgress(Math.min(100, percentage));
    };

    window.addEventListener(
      "scroll",
      calculateProgress
    );

    calculateProgress();

    return () =>
      window.removeEventListener(
        "scroll",
        calculateProgress
      );
  }, []);

  return (
    <div
      className="
        fixed
        top-0
        left-0
        w-full
        h-1
        z-[9999]
        bg-transparent
      "
    >
      <div
        className="
          h-full
          bg-gradient-to-r
          from-blue-600
          to-cyan-500
          transition-all
          duration-150
        "
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}

export default ReadingProgress;