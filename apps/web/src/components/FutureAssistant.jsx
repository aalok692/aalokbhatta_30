import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { apiRequest } from "../lib/api.js";

export default function FutureAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const enabled = import.meta.env.VITE_AI_ENABLED === "true";
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  if (!enabled) return null;

  async function sendMessage(event) {
    event.preventDefault();
    setError("");
    try {
      const result = await apiRequest("/assistant/messages", {
        method: "POST",
        body: JSON.stringify({ message })
      });
      setReply(result.message);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="assistant-widget">
      {open && <section className="assistant-panel" aria-label="Personal assistant">
        <div className="assistant-heading"><strong>Aalok&apos;s assistant</strong><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close assistant"><X size={17} /></button></div>
        <p>This assistant is not configured yet.</p>
        {reply && <p className="assistant-reply">{reply}</p>}
        {error && <p role="alert" className="form-error">{error}</p>}
        <form onSubmit={sendMessage}><label className="sr-only" htmlFor="assistant-message">Ask a question</label><input id="assistant-message" value={message} onChange={(event) => setMessage(event.target.value)} required maxLength={1000} placeholder="Ask about my work…" /><button className="button button-dark" type="submit">Send</button></form>
      </section>}
      <button className="assistant-launcher" onClick={() => setOpen(!open)} aria-label={open ? "Close assistant" : "Open assistant"}><MessageCircle size={19} /></button>
    </div>
  );
}
