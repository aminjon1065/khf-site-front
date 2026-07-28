"use client";

import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({
  label,
  title,
}: {
  label: string;
  title: string;
}) {
  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.getAttribute("data-theme") === "dark";

    if (isDark) {
      root.removeAttribute("data-theme");
      localStorage.setItem("kchs-theme", "light");
      return;
    }

    root.setAttribute("data-theme", "dark");
    localStorage.setItem("kchs-theme", "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={label}
      title={title}
      className="toplink inline-flex cursor-pointer items-center gap-1.5 border border-transparent bg-transparent px-1.5 py-1 [font:inherit]"
      style={{ color: "inherit" }}
    >
      <Moon
        className="ico-moon"
        size={15}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <Sun className="ico-sun" size={15} strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
