import type { Metadata } from "next";
import { Geist_Mono, Prompt } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ADOCS",
  description: "ADOCS DEPLOYMENT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("h-full", "antialiased", prompt.variable, geistMono.variable)}>
      <body className="min-h-full flex flex-col font-sans items-center">
        <ThemeProvider
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster expand={true} position="top-right"/>
        </ThemeProvider>
      </body>
    </html>
  );
}
