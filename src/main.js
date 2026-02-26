// /src/main.js
import { CalculatorController } from "./controller/calculator.controller.js";
import { bindKeypad } from "./ui/keypad.js";
import { registerSW } from "./pwa/sw-register.js";
import { applyTheme, watchSystemThemeChanges, setThemeMode, getThemeMode } from "./core/theme.js";

const controller = new CalculatorController();
await controller.init();
bindKeypad(controller);

// PWA
registerSW();

// Tema
applyTheme();
watchSystemThemeChanges();

const btnSettings = document.getElementById("btn-settings");
const sheet = document.getElementById("theme-sheet");
const btnClose = document.getElementById("btn-sheet-close");

function markActiveTheme() {
  const mode = getThemeMode();
  document.querySelectorAll("[data-theme-mode]").forEach(b => {
    b.classList.toggle("active", b.dataset.themeMode === mode);
  });
}

btnSettings?.addEventListener("click", () => {
  markActiveTheme();
  sheet?.classList.remove("hidden");
});

btnClose?.addEventListener("click", () => sheet?.classList.add("hidden"));

sheet?.addEventListener("click", (e) => {
  if (e.target === sheet) sheet.classList.add("hidden");
});

document.querySelectorAll("[data-theme-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    setThemeMode(btn.dataset.themeMode);
    markActiveTheme();
    sheet.classList.add("hidden");
  });
});
