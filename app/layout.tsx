import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ritual Quiz Platform",
  description: "Test your knowledge about Ritual - The world's first sovereign execution layer for AI",
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
