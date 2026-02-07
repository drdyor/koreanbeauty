import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const font = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hypno - Get Hypnotised",
  description: "The best self-hypnosis tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" />
        </head>
        
        <body className={font.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
