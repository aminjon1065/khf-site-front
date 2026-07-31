// Крошечная шина событий для индикатора перехода между страницами.
//
// В App Router нет router-событий (`routeChangeStart` остался в Pages Router),
// поэтому старт навигации сообщает сам `<Link>` через проп `onNavigate`, а
// финиш определяется сменой `usePathname()` — то есть моментом, когда новый
// маршрут уже отрисован. Отдельная библиотека (nprogress и подобные) не нужна:
// всё поведение — три строчки состояния плюс CSS-анимация.

type Listener = () => void;

const listeners = new Set<Listener>();

/** Сообщить индикатору, что начался переход. Вызывается из LocaleLink. */
export function startNavigationProgress(): void {
  for (const listener of listeners) {
    listener();
  }
}

/** Подписка индикатора. Возвращает функцию отписки для useEffect. */
export function onNavigationStart(listener: Listener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
