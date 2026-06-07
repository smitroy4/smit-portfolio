import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;