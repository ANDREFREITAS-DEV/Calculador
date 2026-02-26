// /src/core/formatter.js
export function formatNumber(value) {
  // value pode ser string com ".", convertemos para PT-BR com vírgula
  if (value == null) return "0";
  const s = String(value);
  if (s === "NaN" || s === "Infinity" || s === "-Infinity") return "Erro";
  // Se for número grande/decimal, preserva como string mas troca ponto por vírgula
  return s.replace(".", ",");
}
