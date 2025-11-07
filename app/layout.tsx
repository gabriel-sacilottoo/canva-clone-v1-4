import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image Frame & Crop System",
  description: "Canvas Clone - Image Frame Structure & Aspect Ratio System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
