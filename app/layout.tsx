import type { Metadata, Viewport } from "next";
import { Caveat, Creepster, IM_Fell_English } from "next/font/google";
import "./globals.css";

const creepster = Creepster({ weight: "400", subsets: ["latin"], variable: "--font-creepster" });
const fell = IM_Fell_English({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-fell" });
const caveat = Caveat({ weight: ["500", "700"], subsets: ["latin"], variable: "--font-caveat" });

export const metadata: Metadata = {
  title: "Sugar Cubes from the Crypt",
  description:
    "A sealed Halloween sugar cube from the Executive Board 26.27, AIESEC in University of Moratuwa.",
};

export const viewport: Viewport = {
  themeColor: "#120e19",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${creepster.variable} ${fell.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
