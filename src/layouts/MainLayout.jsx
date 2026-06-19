import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

import { useTheme } from "../components/common/ThemeWrapper";

function MainLayout({ children }) {
const { theme } = useTheme();

return (
<div
className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme === "light"
          ? `
bg-gradient-to-b
from-white
via-white
to-blue-50/40
text-zinc-900
`
          : "bg-zinc-950 text-zinc-100"
      }`}
>
{/* Decorative blur */}
{theme === "light" && (
<> <div
         className="
           fixed
           top-0
           left-0
           w-[500px]
           h-[500px]
           rounded-full
           bg-blue-100/30
           blur-3xl
           pointer-events-none
           -z-10
         "
       />

      <div
        className="
          fixed
          bottom-0
          right-0
          w-[500px]
          h-[500px]
          rounded-full
          bg-sky-100/30
          blur-3xl
          pointer-events-none
          -z-10
        "
      />
    </>
  )}

  <Navbar />

  <main className="flex-1">
    {children}
  </main>

  <Footer />
</div>

);
}

export default MainLayout;
