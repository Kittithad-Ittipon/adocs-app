import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Prompt, Kanit } from "next/font/google";
import "./globals.css";

export const metadata = {
  title: {
    template: "%s | ADOCS",
    default: "ADOCS",
  },
};

const navbar = (
  <Navbar
    logo={<b className="text-2xl">ADOCS</b>}
    projectLink="https://github.com/Kittithad-Ittipon/adocs-document.git"
  />
);

const promptSans = Prompt({
  variable: "--font-sans",
  subsets: ["latin", "thai"],
  weight: ["200","300","400","500","600","700","800","900"],
});

const kanit = Kanit({
  variable: "--font-sans",
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const footer = <Footer>MIT {new Date().getFullYear()} © Nextra.</Footer>;

export default async function RootLayout({ children }) {
  return (
    <html
      // Not required, but good for SEO
      lang="th"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
      className={kanit.variable}
    >
      <Head
      // ... Your additional head options
      >
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
      </Head>
      <body className="font-sans" suppressHydrationWarning={true}>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/Kittithad-Ittipon/adocs-document"
          sidebar={{ defaultMenuCollapseLevel: 1, toggleButton: false }}
          editLink={null}
          // navigation={false}
          
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
