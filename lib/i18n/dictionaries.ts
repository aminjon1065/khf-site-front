import "server-only";
import type { Locale } from "@/lib/i18n/config";
import { ru, type Dictionary } from "./dictionaries/ru";
import { tj } from "./dictionaries/tj";
import { en } from "./dictionaries/en";

// Словари загружаются на сервере (серверные компоненты), в клиентский бандл не
// попадают. Нужные строки прокидываются в клиентские компоненты как props.

const dictionaries: Record<Locale, Dictionary> = { ru, tj, en };

/** Словарь интерфейса для активной локали. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
