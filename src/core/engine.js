// /src/core/engine.js
// Calculadora SEQUENCIAL (modo "calculadora simples") — estável e previsível.
// Estado: idle | typing | operator | result
// Interno usa "."; UI exibe "," via formatter.

import { formatNumber } from "./formatter.js";

const OPS = new Set(["+", "-", "×", "÷"]);

export class Engine {
  constructor() { this.reset(); }

  reset() {
    this.state = "idle";
    this.current = "0";
    this.acc = null;
    this.opPending = null;

    this.last = null;
    this.repeatOp = null;
    this.repeatValue = null;

    this.expr = "";
  }

  _toNumber(str) {
    const s = String(str).replace(",", ".");
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  _normalizeCurrent() {
    if (this.current === "" || this.current === "-") this.current = "0";
    if (this.current.startsWith(".")) this.current = "0" + this.current;
    if (this.current.startsWith("-.")) this.current = "-0" + this.current.slice(1);

    const neg = this.current.startsWith("-");
    const raw = neg ? this.current.slice(1) : this.current;

    if (raw.includes(".")) {
      const [a, b] = raw.split(".");
      const na = a.replace(/^0+(?=\d)/, "") || "0";
      this.current = (neg ? "-" : "") + na + "." + b;
      return;
    }

    const ni = raw.replace(/^0+(?=\d)/, "") || "0";
    this.current = (neg ? "-" : "") + ni;
  }

  _apply(a, op, b) {
    if (op === "+") return a + b;
    if (op === "-") return a - b;
    if (op === "×") return a * b;
    if (op === "÷") return b === 0 ? NaN : a / b;
    return b;
  }

  _startNewAfterResult() {
    this.acc = null;
    this.opPending = null;
    this.repeatOp = null;
    this.repeatValue = null;
    this.current = "0";
    this.expr = "";
    this.state = "idle";
  }

  _fmt(v) {
    return formatNumber(v);
  }

  _syncExprTyping() {
    // Mantém a expressão “ao vivo” no display pequeno.
    if (this.opPending && this.acc != null) {
      if (this.state === "operator") {
        this.expr = `${this._fmt(this.acc)} ${this.opPending}`;
      } else {
        this.expr = `${this._fmt(this.acc)} ${this.opPending} ${this._fmt(this.current)}`;
      }
    } else {
      this.expr = "";
    }
  }

  inputDigit(d) {
    const digit = String(d);
    if (this.state === "result") this._startNewAfterResult();

    // Se acabamos de apertar um operador, o próximo dígito substitui o número.
    if (this.state === "operator") this.current = digit;
    else if (this.current === "0") this.current = digit;
    else this.current += digit;

    this._normalizeCurrent();
    this.state = "typing";
    this._syncExprTyping();
  }

  inputDecimalComma() {
    if (this.state === "result") this._startNewAfterResult();

    // Depois de operador, começa um novo número.
    if (this.state === "operator") this.current = "0";

    if (!this.current.includes(".")) this.current += ".";
    this._normalizeCurrent();
    this.state = "typing";
    this._syncExprTyping();
  }

  backspace() {
    if (this.state === "result") this.state = "typing";

    if (this.current.length <= 1) this.current = "0";
    else {
      this.current = this.current.slice(0, -1);
      if (this.current === "-" || this.current === "") this.current = "0";
    }
    this._normalizeCurrent();
    this._syncExprTyping();
  }

  clearEntry() {
    this.current = "0";
    this._normalizeCurrent();
    if (this.state === "typing") this.state = "operator";
    this._syncExprTyping();
  }

  clearAll() { this.reset(); }

  toggleSign() {
    if (this.state === "result") this.state = "typing";
    if (this.current === "0") return;
    this.current = this.current.startsWith("-") ? this.current.slice(1) : "-" + this.current;
    this._normalizeCurrent();
    this._syncExprTyping();
  }

  op(operator) {
    if (!OPS.has(operator)) return;

    if (this.state === "result") {
      const base = this.last != null ? this.last : this._toNumber(this.current);
      this.acc = base;
      this.opPending = operator;
      this.state = "operator";
      this._syncExprTyping();
      return;
    }

    const cur = this._toNumber(this.current);

    // Se o usuário apertar operador duas vezes, só troca o operador.
    if (this.state === "operator") {
      if (this.acc == null) this.acc = cur;
      this.opPending = operator;
      this._syncExprTyping();
      return;
    }

    if (this.acc == null) this.acc = cur;
    else if (this.opPending) this.acc = this._apply(this.acc, this.opPending, cur);
    else this.acc = cur;

    this.opPending = operator;
    // Mostra o resultado parcial (ex: 8+8+ -> 16 grande) e espera o próximo número.
    this.current = String(this.acc);
    this.state = "operator";
    this._normalizeCurrent();
    this._syncExprTyping();
  }

  percent() {
    const cur = this._toNumber(this.current);

    if (this.opPending && this.acc != null) {
      if (this.opPending === "+" || this.opPending === "-") {
        this.current = String(this.acc * (cur / 100));
      } else {
        this.current = String(cur / 100);
      }
    } else {
      this.current = String(cur / 100);
    }

    this._normalizeCurrent();
    this.state = "typing";
    this._syncExprTyping();
  }

  equals() {
    if (this.state === "result") {
      if (this.repeatOp && this.repeatValue != null && this.last != null) {
        const prev = this.last;
        const next = this._apply(prev, this.repeatOp, this.repeatValue);
        this.last = next;
        this.current = String(next);
        this.expr = `${this._fmt(prev)} ${this.repeatOp} ${this._fmt(this.repeatValue)} = ${this._fmt(next)}`;
        return next;
      }
      return this.last ?? this._toNumber(this.current);
    }

    const cur = this._toNumber(this.current);

    if (!this.opPending || this.acc == null) {
      this.last = cur;
      this.current = String(cur);
      this.expr = `${this._fmt(cur)} = ${this._fmt(cur)}`;
      this.state = "result";
      this.repeatOp = null;
      this.repeatValue = null;
      return cur;
    }

    const operand = this.state === "operator" ? this.acc : cur;
    const result = this._apply(this.acc, this.opPending, operand);

    this.repeatOp = this.opPending;
    this.repeatValue = operand;

    this.expr = `${this._fmt(this.acc)} ${this.opPending} ${this._fmt(operand)} = ${this._fmt(result)}`;

    this.last = result;
    this.current = String(result);

    this.acc = null;
    this.opPending = null;
    this.state = "result";

    return result;
  }

  setCurrentFromHistory(valueStr) {
    const normalized = String(valueStr).replace(",", ".");
    this.current = normalized;
    if (this.state === "result") this.state = "typing";
    this._normalizeCurrent();
    this._syncExprTyping();
  }

  get displayValue() { return this.current; }
}
