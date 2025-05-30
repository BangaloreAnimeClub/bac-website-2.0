"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use resolvedTheme for SSR safety
  const isDark = (mounted ? (resolvedTheme === "dark") : false);

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle Theme">
      <Sun className={
        "h-[1.4rem] w-[1.4rem] rotate-0 scale-100 transition-all" +
        (isDark ? " dark:-rotate-90 dark:scale-0" : "")
      } />
      <Moon className={
        "absolute h-[1.4rem] w-[1.4rem] rotate-90 scale-0 transition-all" +
        (isDark ? " dark:rotate-0 dark:scale-100" : "")
      } />
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
}
