import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import PageMeta from "../components/PageMeta.jsx";
import { EmptyState, LoadState } from "../components/States.jsx";
import useResource from "../lib/useResource.js";

function readingMinutes(body = "") {
  return Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 220));
}

export default function Journal() {
  const { data, loading, error } = useResource("/public/posts");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const posts = data?.items ?? [];
  const categories = ["All", ...new Set(posts.map((post) => post.category).filter(Boolean))];
  const filtered = useMemo(() => posts.filter((post) =>
    (category === "All" || post.category === category) &&
    `${post.title} ${post.excerpt} ${post.tags?.join(" ")}`.toLowerCase().includes(query.toLowerCase())
  ), [posts, query, category]);
  return (
    <>
      <PageMeta title="Journal" description="Notes, learning, and ideas from Aalok Bhatta." />
      <section className="page-hero section-shell page-hero-compact">
        <div className="eyebrow"><span className="mono">NOTES / 04</span> IDEAS IN THE MAKING</div>
        <h1>Learning out<br /><span>loud.</span></h1>
        <p className="page-lede">Notes on software, the learning process, and the questions I’m thinking through. Clear writing is part of understanding the work.</p>
      </section>
      <section className="section-shell listing-section journal-listing">
        <div className="listing-tools"><label className="search-field"><Search size={17} /><span className="sr-only">Search journal posts</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes…" /></label><div className="filter-list" aria-label="Filter by category">{categories.map((item) => <button key={item} className={category === item ? "filter-chip selected" : "filter-chip"} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
        {loading ? <LoadState /> : error ? <LoadState error={error} /> : filtered.length ? <div className="journal-list">
          {filtered.map((post) => <Link className="journal-row" key={post._id} to={`/journal/${post.slug}`}>
            <span className="mono journal-date">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }) : "NOTE"}</span>
            <div><span className="eyebrow">{post.category || "FIELD NOTES"} · {readingMinutes(post.body)} MIN READ</span><h2>{post.title}</h2><p>{post.excerpt}</p><div className="tag-row">{(post.tags || []).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></div>
            <ArrowUpRight size={19} />
          </Link>)}
        </div> : <EmptyState title={query ? "No notes found" : "The first notes are being written"}>{query ? "Try another search." : "This journal is ready for technical notes, tutorials, development experiences, and thoughts."}</EmptyState>}
      </section>
    </>
  );
}
