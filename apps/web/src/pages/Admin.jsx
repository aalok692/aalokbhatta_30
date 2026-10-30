import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, FileImage, FileText, FolderKanban, LogOut, Mail, Plus, Save, Settings, Trash2 } from "lucide-react";
import { apiRequest } from "../lib/api.js";

const sections = [
  ["overview", "Overview", Settings],
  ["projects", "Projects", FolderKanban],
  ["posts", "Journal", FileText],
  ["gallery", "Gallery", FileImage],
  ["messages", "Inbox", Mail],
  ["settings", "Site settings", Settings]
];

const blankProject = { title: "", slug: "", summary: "", description: "", imageUrl: "", technologies: "", githubUrl: "", liveUrl: "", category: "", featured: false, published: false };
const blankPost = { title: "", slug: "", excerpt: "", body: "", category: "", tags: "", published: false };

function toForm(item, type) {
  if (!item) return type === "projects" ? { ...blankProject } : { ...blankPost };
  return {
    ...item,
    technologies: (item.technologies || []).join(", "),
    tags: (item.tags || []).join(", ")
  };
}

function toPayload(form, type) {
  const { technologies, tags, ...rest } = form;
  return {
    ...rest,
    ...(type === "projects" ? { technologies: technologies.split(",").map((value) => value.trim()).filter(Boolean) } : { tags: tags.split(",").map((value) => value.trim()).filter(Boolean) })
  };
}

export default function Admin() {
  const location = useLocation();
  const navigate = useNavigate();
  const section = location.pathname.split("/")[2] || "overview";
  const [admin, setAdmin] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [data, setData] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankProject);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({ introduction: "", availability: "not-looking", resumeUrl: "", about: { background: "", journey: "", education: "", experience: "", goals: "" }, socialLinks: { github: "", linkedin: "", email: "" } });
  const [counts, setCounts] = useState({});
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const robotsMeta = document.querySelector('meta[name="robots"]');
    const previousRobots = robotsMeta?.content;
    if (robotsMeta) robotsMeta.content = "noindex,nofollow";
    document.title = "Admin — Aalok Bhatta";
    return () => {
      if (robotsMeta && previousRobots) robotsMeta.content = previousRobots;
    };
  }, []);

  useEffect(() => {
    apiRequest("/admin/auth/me").then((response) => setAdmin(response.admin)).catch((requestError) => {
      if (requestError.status !== 401) setError(requestError.message);
      setAdmin(null);
    }).finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!admin) return;
    setError("");
    setMessage("");
    setEditing(null);
    if (section === "overview") {
      Promise.all(["projects", "posts", "gallery", "messages"].map((key) => apiRequest(`/admin/${key}`)))
        .then((results) => setCounts(Object.fromEntries(["projects", "posts", "gallery", "messages"].map((key, index) => [key, (results[index].items ?? results[index].messages ?? []).length]))))
        .catch((requestError) => setError(requestError.message));
      return;
    }
    if (section === "settings") {
      apiRequest("/admin/settings").then((response) => setSettings(response.settings)).catch((requestError) => setError(requestError.message));
      return;
    }
    apiRequest(`/admin/${section}`).then((response) => setData(response.items ?? response.messages ?? [])).catch((requestError) => setError(requestError.message));
  }, [admin, section]);

  async function login(event) {
    event.preventDefault();
    setLoginError("");
    try {
      const response = await apiRequest("/admin/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      setAdmin(response.admin);
      navigate("/admin/overview");
    } catch (requestError) {
      setLoginError(requestError.message);
    }
  }

  async function logout() {
    try {
      await apiRequest("/admin/auth/logout", { method: "POST", body: JSON.stringify({}) });
      setAdmin(null);
      navigate("/admin");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function startEdit(item, type) {
    setEditing(item?._id ?? "new");
    setForm(toForm(item, type));
  }

  async function saveContent(event) {
    event.preventDefault();
    const type = section === "posts" ? "posts" : "projects";
    const payload = toPayload(form, type);
    const path = `/admin/${type}${editing === "new" ? "" : `/${editing}`}`;
    try {
      await apiRequest(path, { method: editing === "new" ? "POST" : "PUT", body: JSON.stringify(payload) });
      setMessage(`${type === "posts" ? "Journal note" : "Project"} saved.`);
      setEditing(null);
      const response = await apiRequest(`/admin/${type}`);
      setData(response.items || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function removeItem(item) {
    if (!window.confirm(`Permanently delete "${item.title}"?`)) return;
    try {
      await apiRequest(`/admin/${section}/${item._id}`, { method: "DELETE" });
      setData((current) => current.filter((entry) => entry._id !== item._id));
      setMessage("Item deleted.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function uploadImage(event) {
    event.preventDefault();
    if (!imageFile) return;
    const formElement = event.currentTarget;
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("title", event.currentTarget.elements.title.value);
    formData.append("caption", event.currentTarget.elements.caption.value);
    formData.append("category", event.currentTarget.elements.category.value);
    formData.append("alt", event.currentTarget.elements.alt.value);
    formData.append("description", event.currentTarget.elements.description.value);
    try {
      const result = await apiRequest("/admin/gallery", { method: "POST", body: formData });
      setData((current) => [result.item, ...current]);
      setImageFile(null);
      formElement.reset();
      setMessage("Image uploaded.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveSettings(event) {
    event.preventDefault();
    try {
      const result = await apiRequest("/admin/settings", { method: "PUT", body: JSON.stringify(settings) });
      setSettings(result.settings);
      setMessage("Site settings saved.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function updateMessage(item, read) {
    try {
      await apiRequest(`/admin/messages/${item._id}`, { method: "PATCH", body: JSON.stringify({ read }) });
      setData((current) => current.map((entry) => entry._id === item._id ? { ...entry, read } : entry));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteMessage(item) {
    if (!window.confirm(`Permanently delete the message from ${item.name}?`)) return;
    try {
      await apiRequest(`/admin/messages/${item._id}`, { method: "DELETE" });
      setData((current) => current.filter((entry) => entry._id !== item._id));
      setMessage("Message deleted.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (!authChecked) return <div className="admin-screen"><p>Checking admin session…</p></div>;
  if (!admin) return <div className="admin-login-wrap"><div className="admin-login-card"><a className="back-link" href="/"><ArrowLeft size={15} /> Public website</a><span className="eyebrow">PRIVATE SPACE / ADMIN</span><h1>Welcome back<span className="accent">.</span></h1><p>Sign in to manage your website.</p>{error && <p className="form-error" role="alert">{error}</p>}<form onSubmit={login}><label className="form-field">Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label className="form-field">Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{loginError && <p className="form-error" role="alert">{loginError}</p>}<button className="button button-dark" type="submit">Sign in <ArrowUpRight size={16} /></button></form></div></div>;

  const contentType = section === "posts" ? "posts" : "projects";
  const contentFields = contentType === "posts"
    ? [["title", "Title"], ["slug", "URL slug"], ["excerpt", "Short summary"], ["category", "Category"], ["tags", "Tags (comma separated)"], ["body", "Markdown body"]]
    : [["title", "Title"], ["slug", "URL slug"], ["summary", "Short summary"], ["category", "Category"], ["technologies", "Technologies (comma separated)"], ["imageUrl", "Image URL"], ["githubUrl", "GitHub URL"], ["liveUrl", "Live URL"], ["description", "Description"]];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="wordmark" href="/"><span className="wordmark-mark">A</span><span>aalok<span className="wordmark-dot">.</span></span></a>
        <span className="eyebrow admin-eyebrow">SITE MANAGEMENT</span>
        <nav aria-label="Admin navigation">{sections.map(([key, label, Icon]) => <button className={section === key ? "admin-nav-item active" : "admin-nav-item"} key={key} onClick={() => navigate(`/admin/${key}`)}><Icon size={17} />{label}{key === "messages" && (counts.messages || data.filter((item) => !item.read).length) > 0 && <span className="inbox-count">{counts.messages || data.filter((item) => !item.read).length}</span>}</button>)}</nav>
        <div className="admin-sidebar-bottom"><span className="admin-user">{admin.email}</span><button className="admin-nav-item" onClick={logout}><LogOut size={17} />Sign out</button><a href="/" className="admin-preview">View website <ArrowUpRight size={15} /></a></div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><div><span className="eyebrow">AALOKBHATTA.COM / ADMIN</span><h1>{sections.find(([key]) => key === section)?.[1] || "Admin"}</h1></div><span className="admin-live"><i /> PRIVATE</span></header>
        {error && <p className="admin-alert form-error" role="alert">{error}</p>}
        {message && <p className="admin-alert form-success" role="status">{message}</p>}
        {section === "overview" && <div className="admin-overview"><div className="admin-welcome"><span className="eyebrow">GOOD TO SEE YOU</span><h2>Your corner of the internet,<br />all in one place.</h2><p>Manage your writing, projects, gallery, and incoming messages from here.</p></div><div className="admin-stats">{[["Projects", "projects"], ["Journal notes", "posts"], ["Gallery images", "gallery"], ["Messages", "messages"]].map(([label, key]) => <button key={key} onClick={() => navigate(`/admin/${key}`)}><span className="eyebrow">{label}</span><strong>{counts[key] ?? "—"}</strong><span>Manage {label.toLowerCase()} <ArrowUpRight size={14} /></span></button>)}</div></div>}
        {(section === "projects" || section === "posts") && <section className="admin-content">
          <div className="admin-section-heading"><div><h2>{section === "posts" ? "Your journal" : "Your projects"}</h2><p>Only published items are visible on the public site.</p></div><button className="button button-dark" onClick={() => startEdit(null, contentType)}><Plus size={16} /> New {section === "posts" ? "note" : "project"}</button></div>
          {editing !== null && <form className="admin-edit-form" onSubmit={saveContent}><div className="admin-form-heading"><h3>{editing === "new" ? "Create" : "Edit"} {section === "posts" ? "note" : "project"}</h3><button type="button" className="text-button" onClick={() => setEditing(null)}>Cancel</button></div><div className="admin-form-grid">{contentFields.map(([key, label]) => <label className={`form-field ${["description", "body"].includes(key) ? "field-wide" : ""}`} key={key}>{label}{["description", "body"].includes(key) ? <textarea rows={key === "body" ? 14 : 6} value={form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} required={key === "body"} /> : <input value={form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} required={["title", "slug", "summary"].includes(key)} />}</label>)}<label className="check-field"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /> Published</label>{section === "projects" && <label className="check-field"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Feature on homepage</label>}</div><button className="button button-dark" type="submit"><Save size={16} /> Save changes</button></form>}
          <div className="admin-item-list">{data.map((item) => <article className="admin-item" key={item._id}><div><span className={`publish-badge ${item.published ? "is-published" : ""}`}>{item.published ? "Published" : "Draft"}</span><h3>{item.title}</h3><p>{item.summary || item.excerpt || item.slug}</p></div><div className="admin-item-actions"><button className="icon-button" onClick={() => startEdit(item, contentType)} aria-label={`Edit ${item.title}`}>Edit</button><button className="icon-button danger-action" onClick={() => removeItem(item)} aria-label={`Delete ${item.title}`}><Trash2 size={16} /></button></div></article>)}{!data.length && <div className="admin-empty">Nothing here yet. Create your first item when you’re ready.</div>}</div>
        </section>}
        {section === "gallery" && <section className="admin-content"><div className="admin-section-heading"><div><h2>Gallery</h2><p>Upload real photographs; images are optimized and stored outside MongoDB.</p></div></div><form className="admin-edit-form upload-form" onSubmit={uploadImage}><label className="form-field">Photograph<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} required /></label><div className="admin-form-grid"><label className="form-field">Title<input name="title" maxLength="120" /></label><label className="form-field">Caption<input name="caption" maxLength="300" /></label><label className="form-field">Category<input name="category" maxLength="60" /></label><label className="form-field">Alt text<input name="alt" maxLength="300" /></label><label className="form-field field-wide">Description<textarea name="description" rows="3" maxLength="1000" /></label></div><button className="button button-dark" type="submit">Upload image <ArrowUpRight size={16} /></button></form><div className="admin-gallery-grid">{data.map((item) => <article key={item._id}><img src={item.thumbnailUrl || item.imageUrl} alt={item.alt || ""} /><div><strong>{item.title || item.caption || "Untitled image"}</strong><button className="icon-button danger-action" onClick={() => removeItem(item)} aria-label="Delete image"><Trash2 size={16} /></button></div><a className="admin-image-url" href={item.imageUrl} target="_blank" rel="noreferrer">Open optimized image ↗</a></article>)}</div></section>}
        {section === "messages" && <section className="admin-content"><div className="admin-section-heading"><div><h2>Contact inbox</h2><p>Messages submitted through the public contact form.</p></div></div><div className="inbox-list">{data.map((item) => <article className={item.read ? "inbox-message read" : "inbox-message"} key={item._id}><div className="inbox-message-head"><div><span className="eyebrow">{item.email} · {new Date(item.createdAt).toLocaleString()}</span><h3>{item.subject}</h3><p>From {item.name}</p></div><div className="admin-item-actions">{!item.read && <button className="text-button" onClick={() => updateMessage(item, true)}>Mark read</button>}<button className="icon-button danger-action" onClick={() => deleteMessage(item)} aria-label={`Delete message from ${item.name}`}><Trash2 size={16} /></button></div></div><p className="inbox-body">{item.message}</p><a className="detail-link" href={`mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent(`Re: ${item.subject}`)}`}>Reply by email <ArrowUpRight size={15} /></a></article>)}{!data.length && <div className="admin-empty">Your inbox is clear.</div>}</div></section>}
        {section === "settings" && <section className="admin-content"><div className="admin-section-heading"><div><h2>Public profile</h2><p>These details appear across the public website.</p></div></div><form className="admin-edit-form" onSubmit={saveSettings}><label className="form-field">Home introduction<textarea rows="4" maxLength="1000" value={settings.introduction} onChange={(event) => setSettings({ ...settings, introduction: event.target.value })} /></label><label className="form-field">Availability<select value={settings.availability} onChange={(event) => setSettings({ ...settings, availability: event.target.value })}><option value="available">Available for conversations</option><option value="limited">Limited availability</option><option value="not-looking">Not looking right now</option></select></label><div className="admin-form-grid"><label className="form-field">GitHub URL<input type="url" value={settings.socialLinks.github} onChange={(event) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, github: event.target.value } })} /></label><label className="form-field">LinkedIn URL<input type="url" value={settings.socialLinks.linkedin} onChange={(event) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, linkedin: event.target.value } })} /></label><label className="form-field">Public email<input type="email" value={settings.socialLinks.email} onChange={(event) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, email: event.target.value } })} /></label><label className="form-field">Resume URL<input type="url" value={settings.resumeUrl || ""} onChange={(event) => setSettings({ ...settings, resumeUrl: event.target.value })} /></label></div><span className="eyebrow">ABOUT PAGE CONTENT</span><div className="admin-form-grid">{[["background", "Background"], ["journey", "Software journey"], ["education", "Education"], ["experience", "Experience"], ["goals", "Professional goals"]].map(([key, label]) => <label className="form-field" key={key}>{label}<textarea rows="3" maxLength={key === "education" ? 2000 : 4000} value={settings.about?.[key] || ""} onChange={(event) => setSettings({ ...settings, about: { ...settings.about, [key]: event.target.value } })} /></label>)}</div><button className="button button-dark" type="submit"><Save size={16} /> Save profile</button></form></section>}
      </main>
    </div>
  );
}
