// /src/ui/keypad.js
import { $$, $ } from "./dom.js";

// Ripple leve: cria um span no ponto do toque
function attachRipple(btn) {
  const make = (clientX, clientY) => {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = clientX - rect.left - size / 2;
    const y = clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  };

  btn.addEventListener("pointerdown", (e) => {
    // evita ripple em clique secundário
    if (e.button !== 0) return;
    make(e.clientX, e.clientY);
  });
}

export function bindKeypad(controller) {
  // ripple em todos botões do keypad
  $$("#keypad button").forEach(attachRipple);

  $$("#keypad [data-digit]").forEach(btn => {
    btn.addEventListener("click", () => controller.digit(btn.dataset.digit));
  });

  $$("#keypad [data-op]").forEach(btn => {
    btn.addEventListener("click", () => controller.op(btn.dataset.op));
  });

  $("#btn-dot")?.addEventListener("click", () => controller.dot());
  $("#btn-eq")?.addEventListener("click", () => controller.equals());

  $("#btn-ce")?.addEventListener("click", () => controller.clearEntry());
  $("#btn-ac")?.addEventListener("click", () => controller.clearAll());
  $("#btn-back")?.addEventListener("click", () => controller.backspace());

  $("#btn-percent")?.addEventListener("click", () => controller.percent());
  $("#btn-sign")?.addEventListener("click", () => controller.toggleSign());
}
