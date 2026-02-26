// /src/storage/db.js
const DB_NAME = "calc_db";
const DB_VERSION = 1;

export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("history")) {
        const store = db.createObjectStore("history", { keyPath: "id", autoIncrement: true });
        store.createIndex("createdAt", "createdAt");
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// helper: abre transaction e retorna objectStore
export async function tx(storeName, mode = "readonly") {
  const db = await openDB();
  const t = db.transaction(storeName, mode);
  const store = t.objectStore(storeName);
  // expõe tx para quem quiser aguardar
  store.__tx = t;
  return store;
}

export function waitTx(store) {
  return new Promise((resolve, reject) => {
    const t = store.__tx;
    if (!t) return resolve();
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}
