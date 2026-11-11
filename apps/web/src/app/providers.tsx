"use client";

import { useRouter } from "next/navigation";
import { RouterProvider } from "react-aria-components";

declare module "react-aria-components" {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
  }
}

/** React Aria links navigate through the Next router (client-side transitions, prefetch-free). */
export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <RouterProvider
      navigate={(href, opts) => {
        router.push(href, opts);
      }}
    >
      {children}
    </RouterProvider>
  );
}
