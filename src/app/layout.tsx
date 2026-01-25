import type { Metadata } from "next";
import { Geist, Geist_Mono, Ballet } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ballet = Ballet({
  variable: "--font-ballet",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Yunbo Heater - Piano Lessons",
  description: "Personal one-on-one piano lessons in Yunbo Heater's home studio for all ages and skill levels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ballet.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
