import type { Metadata } from "next";
import { Archivo, Inter, Big_Shoulders_Stencil } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StoreHydration } from "@/components/layout/store-hydration";
import { SITE_URL } from "@/lib/constants";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bigShouldersStencil = Big_Shoulders_Stencil({
  variable: "--font-big-shoulders-stencil",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "LePlug Autocare",
  description:
    "Nairobi's plug for premium car care — parts, accessories, and detailing, done right.",
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "LePlug Autocare",
    title: "LePlug Autocare",
    description:
      "Nairobi's plug for premium car care — parts, accessories, and detailing, done right.",
    images: [{ url: "/images/og/default.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LePlug Autocare",
    description:
      "Nairobi's plug for premium car care — parts, accessories, and detailing, done right.",
    images: ["/images/og/default.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} ${bigShouldersStencil.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">
        <StoreHydration />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
