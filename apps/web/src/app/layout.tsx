import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { Footer } from "@/components/ui/Footer";
import { Header, SITE_NAME } from "@/components/ui/Header";
import { Providers } from "./providers";
import "@/styles/globals.css";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — объявления о продаже авто в Кыргызстане`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Объявления о продаже авто в Кыргызстане. В каждом объявлении — цена к рынку, история цены и данные о продавце.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={onest.variable}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Header />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
