// /src/ui/history.js
import { $ } from "./dom.js";

export class HistoryUI {
  constructor() {
    this.listEl = $("#history-list");
    this.panel = $(".history-panel");
    this.backdrop = $(".history-backdrop");
    this.btnClose = $("#btn-close-history");
    this.btnClear = $("#btn-clear-history");

    this.bindEvents();
  }

  bindEvents() {
    this.btnClose?.addEventListener("click", () => this.close());
    this.backdrop?.addEventListener("click", () => this.close());
  }

  open() {
    this.panel.classList.add("active");
    this.backdrop.classList.add("active");
  }

  close() {
    this.panel.classList.remove("active");
    this.backdrop.classList.remove("active");
  }

  render(items) {
    this.listEl.innerHTML = items.map(i =>
      `<li class="hist-item">
        <div class="hist-expr">${i.expr}</div>
        <div class="hist-res hist-click" data-result="${i.result}" role="button">${i.result}</div>
      </li>`
    ).join("");
  }
}