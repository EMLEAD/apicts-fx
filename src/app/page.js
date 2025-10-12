import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <Navbar />

      {/* Main Content Goes Here */}
      <main className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-[#001F5B]">Welcome to Apicts</h1>
      </main>

      <Footer />
    </div>
  );
}
