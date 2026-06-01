"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { useThemeStore } from "@/store/theme";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <SessionProvider>{children}</SessionProvider>;
}
