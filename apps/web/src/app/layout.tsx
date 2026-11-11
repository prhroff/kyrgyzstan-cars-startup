import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { decodeCityCookie } from "@/components/layout/city-cookie";
import { Onest } from "next/font/google";
import { Footer } from "@/components/ui/Footer";
import { Header, SITE_NAME } from "@/components/ui/Header";
import { getMakeOptions } from "@/data/listings";
import { CITY_COOKIE } from "@/lib/city";
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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [makes, jar] = await Promise.all([getMakeOptions(), cookies()]);
  const cookieCity = decodeCityCookie(jar.get(CITY_COOKIE)?.value);
  return (
    <html lang="ru" className={onest.variable}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          {/* Header reads useSearchParams: Next.js requires a Suspense boundary around it. */}
          <Suspense fallback={<div className="h-16 lg:h-20" />}>
            <Header makes={makes} cookieCity={cookieCity} />
          </Suspense>
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
