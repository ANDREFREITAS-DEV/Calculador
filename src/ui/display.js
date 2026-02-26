// /src/ui/display.js
import { $ } from "./dom.js";

export class DisplayUI {
  constructor() {
    this.elValue = $("#display-value");
    this.elExpr = $("#display-expr");
  }

  render({ value, expr }) {
    this.elExpr.textContent = expr || "";
    this.elValue.textContent = value ?? "0";

    this._autoScale();
  }

  _autoScale() {
    // diminui fonte quando ultrapassa o container
    const el = this.elValue;
    if (!el) return;

    el.style.fontSize = ""; // reset
    const max = 44; // px (ajuste no CSS se quiser)
    const min = 22;

    let size = max;
    el.style.fontSize = `${size}px`;

    const parent = el.parentElement;
    if (!parent) return;

    while (size > min && el.scrollWidth > parent.clientWidth) {
      size -= 2;
      el.style.fontSize = `${size}px`;
    }
  }
}