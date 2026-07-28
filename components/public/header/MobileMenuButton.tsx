"use client";

import { Menu } from "lucide-react";

export default function MobileMenuButton({
  menuId,
  openLabel,
}: {
  menuId: string;
  openLabel: string;
}) {
  const openMenu = () => {
    const dialog = document.getElementById(menuId);

    if (dialog instanceof HTMLDialogElement) {
      dialog.showModal();
    }
  };

  return (
    <button
      type="button"
      onClick={openMenu}
      aria-controls={menuId}
      aria-label={openLabel}
      className="hidden h-[46px] w-[46px] flex-none cursor-pointer items-center justify-center border border-[var(--color-divider)] bg-transparent max-[920px]:inline-flex"
      style={{ color: "var(--color-text)" }}
    >
      <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
