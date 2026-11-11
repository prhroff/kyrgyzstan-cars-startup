import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "@/styles/globals.css";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Авто КР",
  description: "Объявления о продаже авто в Кыргызстане",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={onest.variable}>
      <body>{children}</body>
    </html>
  );
}
