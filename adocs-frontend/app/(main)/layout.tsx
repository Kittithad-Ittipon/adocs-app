import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full w-full flex flex-col font-sans items-center dark:bg-[oklch(0.2_0_0)]">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}