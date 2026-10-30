import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import PageMeta from "../components/PageMeta.jsx";
import { EmptyState, LoadState } from "../components/States.jsx";
import useResource from "../lib/useResource.js";

export default function Projects() {
  const { data, loading, error } = useResource("/public/projects");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const items = data?.items ?? [];
  const categories = ["All", ...new Set(items.map((item) => item.category).filter(Boolean))];
  const filtered = useMemo(() => items.filter((item) =>
    (category === "All" || item.category === category) &&
    `${item.title} ${item.summary} ${item.technologies?.join(" ")}`.toLowerCase().includes(query.toLowerCase())
  ), [items, category, query]);
  return (
    <>
      <PageMeta title="Projects" description="Selected projects by Aalok Bhatta." />
      <section className="page-hero section-shell page-hero-compact">
        <div className="eyebrow"><span className="mono">WORK / 02</span> THE BUILD LOG</div>
        <h1>Curiosity, made<br /><span>tangible.</span></h1>
        <p className="page-lede">Projects are a way to turn what I’m learning into something useful. This collection will grow as the work is ready to share.</p>
      </section>
      <section className="section-shell listing-section">
        <div className="listing-tools">
          <label className="search-field"><Search size={17} /><span className="sr-only">Search projects</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a project…" /></label>
          <div className="filter-list" aria-label="Filter by category">{categories.map((item) => <button key={item} className={category === item ? "filter-chip selected" : "filter-chip"} onClick={() => setCategory(item)}>{item}</button>)}</div>
        </div>
        {loading ? <LoadState /> : error ? <LoadState error={error} /> : filtered.length ? <div className="project-grid project-grid-list">
          {filtered.map((project, index) => <Link className="project-card" to={`/projects/${project.slug}`} key={project._id}>
            <div className="project-visual">{project.imageUrl ? <img src={project.imageUrl} alt="" loading="lazy" /> : <div className={`project-placeholder placeholder-${index % 3}`}><span>{project.title.slice(0, 1)}</span><i>{project.category || "PROJECT"}</i></div>}<span className="project-open"><ArrowUpRight size={18} /></span></div>
            <div className="project-meta"><div><h3>{project.title}</h3><p>{project.summary}</p></div><span className="mono">{project.category || "BUILD"}</span></div>
            <div className="tag-row">{(project.technologies || []).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
          </Link>)}
        </div> : <EmptyState title={query ? "No matches this time" : "The first projects are on their way"}>{query ? "Try a different search or category." : "There are no published projects yet. Check back as this collection takes shape."}</EmptyState>}
      </section>
    </>
  );
}
