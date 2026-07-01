import type { Metadata } from "next";
import { Poppins, Inter, Montserrat } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GIR EXIM INTERNATIONAL PVT LTD | Global Commodity Trading",
  description:
    "Connecting Global Markets with Trusted Commodity Trading. Import and export of agricultural commodities including cashew nuts, soybean, cocoa beans, sesame seeds, and more.",
  keywords: [
    "commodity trading",
    "import export",
    "agricultural commodities",
    "cashew nuts",
    "soybean",
    "cocoa beans",
    "GIR EXIM",
    "international trade",
  ],
  openGraph: {
    title: "GIR EXIM INTERNATIONAL PVT LTD",
    description:
      "Connecting Global Markets with Trusted Commodity Trading",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} ${montserrat.variable}`}
    >
      <body className="antialiased noise-overlay">
        {children}
      </body>
    </html>
  );
}
