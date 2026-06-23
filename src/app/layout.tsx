import type { Metadata } from "next";
import { Inter, Cinzel, Playfair_Display, Cormorant_Garamond, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hall of Faith | RCCG Parish",
  description: "Welcome to RCCG Hall of Faith. Transforming lives through the Word, Worship, Prayer, and the power of Jesus Christ. Join us this Sunday!",
  keywords: ["RCCG", "Redeemed Christian Church of God", "Hall of Faith", "Church in Lagos", "Ojodu Berger Church", "Faith", "Worship", "Prayer", "Pastor"],
  openGraph: {
    title: "Hall of Faith | RCCG Parish",
    description: "Welcome to RCCG Hall of Faith. Transforming lives through the Word, Worship, Prayer, and the power of Jesus Christ.",
    url: "https://rccghalloffaith.org",
    siteName: "RCCG Hall of Faith",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} ${cinzel.variable} ${playfairDisplay.variable} ${cormorant.variable} antialiased bg-[#07122D] text-[#FFFFFF]`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
