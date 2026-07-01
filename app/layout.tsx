import type { Metadata } from "next";
import { ToastProvider } from "@/components/shared/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentLoop — Trade Skills. Create Value. Grow Together.",
  description: "A professional skills exchange marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
