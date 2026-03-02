import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/app/components/SessionProvider";

export const metadata: Metadata = {
  title: "SiggyDrop",
  description: "Test your knowledge about Ritual - The world's first sovereign execution layer for AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={barlow.variable}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}

