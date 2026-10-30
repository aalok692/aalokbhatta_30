import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageMeta from "../components/PageMeta.jsx";
import { LoadState } from "../components/States.jsx";
import useResource from "../lib/useResource.js";

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data, loading, error } = useResource(`/public/projects/${encodeURIComponent(slug)}`);
  const project = data?.item;
  if (loading) return <section className="section-shell detail-state"><PageMeta title="Project details" /><LoadState /></section>;
  if (error) return <section className="section-shell detail-state"><PageMeta title="Project unavailable" /><LoadState error={error} /></section>;
  if (!project) return <section className="section-shell detail-state"><PageMeta title="Project not found" /><h1>That project isn’t here.</h1><Link className="text-link" to="/projects"><ArrowLeft size={16} /> Back to projects</Link></section>;
  return (
    <>
      <PageMeta title={project.title} description={project.summary} image={project.imageUrl} />
      <article className="section-shell detail-page">
        <Link className="back-link" to="/projects"><ArrowLeft size={16} /> All projects</Link>
        <div className="detail-heading"><span className="eyebrow">{project.category || "PROJECT"} · {project.createdAt ? new Date(project.createdAt).getFullYear() : "IN PROGRESS"}</span><h1>{project.title}<span className="accent">.</span></h1><p className="page-lede">{project.summary}</p></div>
        <div className="detail-cover">{project.imageUrl ? <img src={project.imageUrl} alt={`${project.title} preview`} /> : <div className="project-placeholder placeholder-2"><span>{project.title.slice(0, 1)}</span><i>IMAGE COMING SOON</i></div>}</div>
        <div className="detail-columns"><div className="detail-body"><span className="eyebrow">OVERVIEW</span><p>{project.description || project.summary}</p></div><aside><span className="eyebrow">BUILT WITH</span><div className="tag-row">{(project.technologies || []).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>{project.githubUrl && <a className="detail-link" href={project.githubUrl} target="_blank" rel="noreferrer">Source code <ExternalLink size={15} /></a>}{project.liveUrl && <a className="detail-link" href={project.liveUrl} target="_blank" rel="noreferrer">View live project <ArrowUpRight size={15} /></a>}</aside></div>
      </article>
    </>
  );
}
