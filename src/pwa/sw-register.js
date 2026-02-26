// /src/pwa/sw-register.js
export function registerSW() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/service-worker.js");
    } catch (e) {
      // sem log barulhento
    }
  });
}
