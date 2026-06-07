import { useEffect, useState } from "react";

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;

      const height =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const percentage =
        (scrollTop / height) * 100;

      setProgress(percentage);
    };

    window.addEventListener(
      "scroll",
      updateProgress
    );

    return () =>
      window.removeEventListener(
        "scroll",
        updateProgress
      );
  }, []);

  return (
    <div
      className="
        fixed
        top-0
        left-0
        h-1
        bg-blue-600
        z-9999
      "
      style={{
        width: `${progress}%`,
      }}
    />
  );
}

export default ReadingProgress;