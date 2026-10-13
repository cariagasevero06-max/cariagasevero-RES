import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISTOREYA | Employee & Admin Portal",
  description: "ISTOREYA (A Store With Many Stories) - Employee & Management Operations Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF7F2] text-[#2C2523] selection:bg-[#FAEBE5] selection:text-[#B85032] antialiased">
        {children}
      </body>
    </html>
  );
}
