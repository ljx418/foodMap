export function registerFoodMapServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!import.meta.env.PROD) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Service worker support varies across embedded mobile browsers; the app remains browser-usable.
    });
  });
}
