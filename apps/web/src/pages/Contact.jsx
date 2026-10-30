import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowUpRight, Check, Mail } from "lucide-react";
import { contactSchema } from "@aalokbhatta/shared";
import PageMeta from "../components/PageMeta.jsx";
import { apiRequest } from "../lib/api.js";
import useResource from "../lib/useResource.js";

export default function Contact() {
  const [result, setResult] = useState("");
  const [requestError, setRequestError] = useState("");
  const { data: settings } = useResource("/public/settings");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(contactSchema) });
  async function submit(values) {
    setRequestError("");
    setResult("");
    try {
      await apiRequest("/public/contact", { method: "POST", body: JSON.stringify(values) });
      setResult("Your message has been sent. Thanks for reaching out.");
      reset();
    } catch (error) {
      setRequestError(error.message);
    }
  }
  const email = settings?.socialLinks?.email;
  return (
    <>
      <PageMeta title="Contact" description="Get in touch with Aalok Bhatta." />
      <section className="page-hero section-shell page-hero-compact">
        <div className="eyebrow"><span className="mono">CONTACT / 05</span> OPEN CHANNEL</div>
        <h1>Good things start<br /><span>with hello.</span></h1>
        <p className="page-lede">Have a question, a useful perspective, or a project in mind? Send a note. I’d be glad to hear from you.</p>
      </section>
      <section className="section-shell contact-layout">
        <div className="contact-aside">
          <span className="eyebrow">A DIRECT LINE</span>
          <h2>Let’s make a connection.</h2>
          <p>Whether it’s about software, learning, or an opportunity to collaborate, my inbox is open.</p>
          {email ? <a className="contact-email" href={`mailto:${email}`}><Mail size={18} /> {email} <ArrowUpRight size={16} /></a> : <p className="muted-small">Email contact will appear here when configured.</p>}
          <div className="contact-aside-note"><span className="status-dot" /> {settings?.availability === "available" ? "Open to conversations" : settings?.availability === "limited" ? "Limited availability" : "Taking time to build"}</div>
        </div>
        <form className="contact-form" onSubmit={handleSubmit(submit)} noValidate>
          <div className="form-grid">
            <label className="form-field">Your name<input autoComplete="name" {...register("name")} placeholder="Name" />{errors.name && <span className="field-error">{errors.name.message}</span>}</label>
            <label className="form-field">Email address<input type="email" autoComplete="email" {...register("email")} placeholder="you@example.com" />{errors.email && <span className="field-error">{errors.email.message}</span>}</label>
          </div>
          <label className="form-field">Subject<input {...register("subject")} placeholder="What’s this about?" />{errors.subject && <span className="field-error">{errors.subject.message}</span>}</label>
          <label className="form-field">Your message<textarea rows="6" {...register("message")} placeholder="A little context goes a long way…" />{errors.message && <span className="field-error">{errors.message.message}</span>}</label>
          <label className="honeypot" aria-hidden="true">Leave this empty<input tabIndex="-1" autoComplete="off" {...register("website")} /></label>
          {result && <p className="form-success" role="status"><Check size={17} />{result}</p>}
          {requestError && <p className="form-error" role="alert">{requestError}</p>}
          <button className="button button-dark submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "Send message"} <ArrowUpRight size={17} /></button>
          <p className="form-privacy">Your message is used only to respond to your inquiry.</p>
        </form>
      </section>
    </>
  );
}
