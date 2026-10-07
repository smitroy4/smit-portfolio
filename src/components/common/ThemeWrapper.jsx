import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const getDeviceTheme = () => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "dark";
  };

  const [theme, setTheme] = useState(() => {
    try {
      const manual = localStorage.getItem("theme-manual") === "true";
      const stored = localStorage.getItem("theme");
      if (manual && (stored === "light" || stored === "dark")) return stored;
    } catch {
      // ignore storage errors (e.g. private mode)
    }
    return getDeviceTheme();
  });

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);

    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  // Follow device theme changes until the user explicitly picks a theme.
  // Once the user toggles, we stop auto-following (flag in storage).
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      try {
        if (localStorage.getItem("theme-manual") !== "true") {
          setTheme(e.matches ? "dark" : "light");
        }
      } catch {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    media.addEventListener?.("change", handleChange);
    return () => media.removeEventListener?.("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    try {
      localStorage.setItem("theme-manual", "true");
    } catch {
      // ignore storage errors
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}