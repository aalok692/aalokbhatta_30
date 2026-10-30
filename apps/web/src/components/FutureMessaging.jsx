import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { apiRequest } from "../lib/api.js";

export default function FutureMessaging() {
  const enabled = import.meta.env.VITE_MESSAGING_ENABLED === "true";
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  if (!enabled) return null;

  async function send(event) {
    event.preventDefault();
    const visitorId = localStorage.getItem("visitor-id") || crypto.randomUUID();
    localStorage.setItem("visitor-id", visitorId);
    setStatus("");
    try {
      await apiRequest("/messaging/messages", { method: "POST", body: JSON.stringify({ visitorId, message }) });
      setMessage("");
      setStatus("Message sent.");
    } catch (error) {
      setStatus(error.message);
    }
  }

  return <div className="assistant-widget">{open && <section className="assistant-panel" aria-label="Visitor messaging"><div className="assistant-heading"><strong>Message Aalok</strong><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close messaging"><X size={17} /></button></div><p>This message channel may be unavailable until its provider is configured.</p><form onSubmit={send}><label className="sr-only" htmlFor="visitor-message">Your message</label><input id="visitor-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} required placeholder="Write a message…" /><button className="button button-dark" type="submit">Send</button></form>{status && <p role="status">{status}</p>}</section>}<button className="assistant-launcher" onClick={() => setOpen(!open)} aria-label={open ? "Close messaging" : "Open visitor messaging"}><MessageCircle size={19} /></button></div>;
}
