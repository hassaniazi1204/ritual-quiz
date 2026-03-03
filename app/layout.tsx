import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from './components/SessionProvider'

export const metadata: Metadata = {
  title: "SiggyDrop",
  description: "A community run game to promote Ritual.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
