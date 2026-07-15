import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "EcoCity Ghana | Smart Community Reporting",
  description:
    "A civic technology and environmental monitoring platform for reporting local community issues across Ghana."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="pt-[65px]">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
