// /src/core/theme.js
const KEY = "calc_theme_mode"; // system | light | dark

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getThemeMode() {
  return localStorage.getItem(KEY) || "system";
}

export function setThemeMode(mode) {
  localStorage.setItem(KEY, mode);
  applyTheme(mode);
}

export function applyTheme(mode = getThemeMode()) {
  const theme = mode === "system" ? getSystemTheme() : mode;
  document.documentElement.setAttribute("data-theme", theme);
}

export function watchSystemThemeChanges() {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", () => {
    if (getThemeMode() === "system") applyTheme("system");
  });
}
