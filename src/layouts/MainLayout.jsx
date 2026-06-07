import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

import { useTheme } from "../components/common/ThemeWrapper";

function MainLayout({ children }) {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme === "light"
          ? "bg-white text-zinc-900"
          : "bg-zinc-950 text-zinc-100"
      }`}
    >
      <Navbar />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}

export default MainLayout;