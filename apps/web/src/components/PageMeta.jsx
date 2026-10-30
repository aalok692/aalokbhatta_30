import { useEffect } from "react";

export default function PageMeta({ title, description, image }) {
  const pageTitle = title ? `${title} — Aalok Bhatta` : "Aalok Bhatta — Building thoughtfully for the web";
  const summary = description || "A personal space for projects, notes, and the journey from Civil Engineering into software.";
  useEffect(() => {
    const canonicalUrl = `https://aalokbhatta.com${window.location.pathname}`;
    document.title = pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", summary);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", pageTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", summary);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonicalUrl);
    document.querySelector('meta[property="og:image"]')?.setAttribute("content", new URL(image || "/favicon.svg", window.location.origin).href);
  }, [pageTitle, summary, image]);
  return null;
}
