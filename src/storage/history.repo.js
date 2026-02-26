// /src/storage/history.repo.js
import { tx, waitTx } from "./db.js";

export async function addHistory({ expr, result }) {
  const store = await tx("history", "readwrite");
  store.add({ expr, result: String(result), createdAt: Date.now() });
  await waitTx(store);
}

export async function listHistory(limit = 50) {
  const store = await tx("history", "readonly");
  const items = await new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });

  items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return items.slice(0, limit);
}

export async function clearHistory() {
  const store = await tx("history", "readwrite");
  store.clear();
  await waitTx(store);
}
