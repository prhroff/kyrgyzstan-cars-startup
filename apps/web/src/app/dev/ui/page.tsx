import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Showcase } from "@/dev/Showcase";

export const metadata: Metadata = {
  title: "UI — витрина компонентов",
  robots: { index: false, follow: false },
};

/** Component showcase. Development only — 404 in production builds. */
export default function DevUiPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <Showcase />;
}
