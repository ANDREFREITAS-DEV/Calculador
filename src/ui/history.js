// /src/ui/history.js
import { $ } from "./dom.js";

export class HistoryUI {
  constructor() {
    this.listEl = $("#history-list");
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
