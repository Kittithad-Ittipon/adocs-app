export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full w-full flex flex-col font-sans items-center">
      <main className="min-h-screen w-full flex justify-center items-center">
        {children}
      </main>
    </div>
  );
}
