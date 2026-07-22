import { common } from "@/lib/copy/common";
import { home } from "@/lib/copy/home";
import { pages } from "@/lib/copy/pages";

// Русский — канонический словарь портала. Строки берутся из существующего
// lib/copy (там же остаётся исходная разметка ссылок), а форма этого объекта
// становится контрактом Dictionary для остальных языков.

export const ru = { common, home, pages } as const;

/**
 * Расширяет строковые/числовые/булевы литералы до базовых типов, сохраняя
 * форму объектов и массивов. Благодаря этому tj/en обязаны повторить структуру
 * словаря (все ключи на месте), но со своими значениями — иначе ошибка типов.
 */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? readonly Widen<U>[]
        : { readonly [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof ru>;
