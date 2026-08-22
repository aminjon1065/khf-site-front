import type { StaticImageData } from "next/image";
import logoEn from "@/public/assets/logo-kchs-en.webp";
import logoRu from "@/public/assets/logo-kchs-ru.webp";
import logoTj from "@/public/assets/logo-kchs-tj.webp";
import type { Locale } from "@/lib/i18n/config";

// Эмблема КЧС существует в трёх языковых вариантах: надпись по кругу набрана
// на языке страницы. Шапка и подвал импортировали только русский файл, поэтому
// на /tj и /en в гербе оставался русский текст.
//
// Импорты статические, а не по шаблону пути: так Next знает размеры каждого
// файла, хеширует его и выдаёт готовый <img> без сдвига макета.
export const logoByLocale: Record<Locale, StaticImageData> = {
  ru: logoRu,
  tj: logoTj,
  en: logoEn,
};
