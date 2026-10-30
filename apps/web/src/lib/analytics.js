export function trackPageView(path) {
  if (import.meta.env.VITE_ANALYTICS_ENABLED !== "true") return;
  if (navigator.doNotTrack === "1") return;
  window.dispatchEvent(new CustomEvent("site:pageview", { detail: { path } }));
}
