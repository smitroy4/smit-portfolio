import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeWrapper";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        h-10
        w-10
        rounded-full
        flex
        items-center
        justify-center
        border
        border-zinc-300
        bg-white
        text-zinc-700
        hover:bg-zinc-100

        dark:bg-zinc-800
        dark:border-zinc-700
        dark:text-yellow-300
        dark:hover:bg-zinc-700

        transition-all
      "
      aria-label="Toggle Theme"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}