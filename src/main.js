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

// Histórico (painel deslizante)
const displayEl = document.querySelector(".display");
const historyPanel = document.getElementById("history-panel");
const historyBackdrop = document.getElementById("history-backdrop");
const btnCloseHistory = document.getElementById("btn-close-history");

function layoutHistoryPanel() {
  if (!displayEl || !historyPanel) return;

  const rect = displayEl.getBoundingClientRect();
  const top = Math.round(rect.bottom + 10);
  const max = Math.round(window.innerHeight * 0.78); // opção A (70–80%)
  const available = Math.round(window.innerHeight - top - 16);
  const height = Math.max(220, Math.min(max, available));

  historyPanel.style.top = `${top}px`;
  historyPanel.style.height = `${height}px`;
}

function openHistory() {
  if (!historyPanel || !historyBackdrop) return;
  layoutHistoryPanel();
  historyPanel.classList.add("active");
  historyBackdrop.classList.add("active");
  historyPanel.setAttribute("aria-hidden", "false");
  historyBackdrop.setAttribute("aria-hidden", "false");
}

function closeHistory() {
  if (!historyPanel || !historyBackdrop) return;

  historyPanel.classList.remove("active");
  historyBackdrop.classList.remove("active");

  // força voltar para fora da tela
  historyPanel.style.top = "-100vh";

  historyPanel.setAttribute("aria-hidden", "true");
  historyBackdrop.setAttribute("aria-hidden", "true");
}

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

// Evita abrir histórico ao tocar no botão de settings
btnSettings?.addEventListener("click", (e) => e.stopPropagation());

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

// Abrir histórico ao tocar no visor
displayEl?.addEventListener("click", () => {
  // se o sheet estiver aberto, não faz nada
  if (sheet && !sheet.classList.contains("hidden")) return;
  openHistory();
});

btnCloseHistory?.addEventListener("click", closeHistory);
historyBackdrop?.addEventListener("click", closeHistory);

// Ao tocar em um resultado do histórico, aplica e fecha
historyPanel?.addEventListener("click", (e) => {
  const t = e.target;
  if (t && t.classList && t.classList.contains("hist-click")) {
    closeHistory();
  }
});

window.addEventListener("resize", () => {
  if (historyPanel?.classList.contains("active")) layoutHistoryPanel();
});
