// Ставит атрибут темы до первой отрисовки, чтобы страница не мигала светлым.
// Вынесено из layout: global-not-found рендерится в обход layout и без этого
// скрипта всегда открывался в светлой теме, даже когда выбрана тёмная.
export const THEME_INIT = `try{if(localStorage.getItem('kchs-theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}`;
