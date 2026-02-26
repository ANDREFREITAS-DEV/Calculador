// /src/controller/calculator.controller.js
import { Engine } from "../core/engine.js";
import { formatNumber } from "../core/formatter.js";
import { DisplayUI } from "../ui/display.js";
import { HistoryUI } from "../ui/history.js";
import { addHistory, listHistory, clearHistory } from "../storage/history.repo.js";

export class CalculatorController {
  constructor() {
    this.engine = new Engine();
    this.display = new DisplayUI();
    this.historyUI = new HistoryUI();
  }

  async init() {
    this.engine.reset();
    await this.refreshHistory();
    this.bindClearHistory();
    this.render();
  }

  render() {
    this.display.render({
      expr: this.engine.expr,
      value: formatNumber(this.engine.displayValue)
    });
  }

  async refreshHistory() {
    const items = await listHistory(50);
    this.historyUI.render(items);
    this.bindHistoryClicks();
  }

  bindHistoryClicks() {
    document.querySelectorAll(".hist-click").forEach(el => {
      el.addEventListener("click", () => {
        const value = el.dataset.result;
        this.engine.setCurrentFromHistory(value);
        this.render();
      });
    });
  }

  bindClearHistory() {
    const btn = document.getElementById("btn-clear-history");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      if (!confirm("Deseja apagar todo o histórico?")) return;
      await clearHistory();
      await this.refreshHistory();
    });
  }

  digit(d) { this.engine.inputDigit(d); this.render(); }
  dot() { this.engine.inputDecimalComma(); this.render(); }
  op(o) { this.engine.op(o); this.render(); }
  percent() { this.engine.percent(); this.render(); }
  toggleSign() { this.engine.toggleSign(); this.render(); }
  clearAll() { this.engine.clearAll(); this.render(); }
  clearEntry() { this.engine.clearEntry(); this.render(); }
  backspace() { this.engine.backspace(); this.render(); }

  async equals() {
    const result = this.engine.equals();
    if (this.engine.expr && result != null) {
      await addHistory({ expr: this.engine.expr, result });
      await this.refreshHistory();
    }
    this.render();
  }
}
