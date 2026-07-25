import type { Metadata } from "next";
import { Geist_Mono, Prompt } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
  weight: ["100", "200", "300", "400", "500", "600", "700" , "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KI",
  description: "KI Sugar Test",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("h-full", "antialiased", prompt.variable, geistMono.variable)}>
      <body className="min-h-full flex flex-col font-sans items-center dark:bg-[oklch(0.2_0_0)]">
        <ThemeProvider
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors expand={true} position="top-right"/>
        </ThemeProvider>
      </body>
    </html>
  );
}
