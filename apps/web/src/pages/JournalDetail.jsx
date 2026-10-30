import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageMeta from "../components/PageMeta.jsx";
import { LoadState } from "../components/States.jsx";
import useResource from "../lib/useResource.js";

export default function JournalDetail() {
  const { slug } = useParams();
  const { data, loading, error } = useResource(`/public/posts/${encodeURIComponent(slug)}`);
  const post = data?.item;
  if (loading) return <section className="section-shell detail-state"><PageMeta title="Journal note" /><LoadState /></section>;
  if (error) return <section className="section-shell detail-state"><PageMeta title="Journal unavailable" /><LoadState error={error} /></section>;
  if (!post) return <section className="section-shell detail-state"><PageMeta title="Note not found" /><h1>That note isn’t here.</h1><Link className="text-link" to="/journal"><ArrowLeft size={16} /> Back to journal</Link></section>;
  const minutes = Math.max(1, Math.ceil(post.body.trim().split(/\s+/).length / 220));
  return (
    <>
      <PageMeta title={post.title} description={post.excerpt} />
      <article className="section-shell article-page">
        <Link className="back-link" to="/journal"><ArrowLeft size={16} /> All notes</Link>
        <header className="article-heading"><span className="eyebrow">{post.category || "FIELD NOTES"} · {minutes} MIN READ</span><h1>{post.title}</h1><p>{post.excerpt}</p><div className="article-date">{post.publishedAt && new Date(post.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div></header>
        <div className="markdown-body"><ReactMarkdown>{post.body}</ReactMarkdown></div>
        <div className="tag-row article-tags">{(post.tags || []).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
      </article>
    </>
  );
}
