import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiggyDrop",
  description: "A community run platform to promote Ritual",
  metadataBase: new URL("https://siggydrop.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
