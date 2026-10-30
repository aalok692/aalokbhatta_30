import { ArrowDownRight, ArrowUpRight, MoveUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageMeta from "../components/PageMeta.jsx";
import { EmptyState, LoadState } from "../components/States.jsx";
import useResource from "../lib/useResource.js";

const paths = ["Full-stack development", "Backend engineering", "Cloud & DevOps"];

export default function Home() {
  const { data: projects, loading, error } = useResource("/public/projects?featured=true&limit=3");
  const { data: settings } = useResource("/public/settings");
  const featured = projects?.items ?? [];
  return (
    <>
      <PageMeta />
      <section className="hero section-shell">
        <div className="hero-topline"><span className="eyebrow"><span className="status-dot" /> PERSONAL WEBSITE · {settings?.availability === "available" ? "OPEN TO CONVERSATIONS" : settings?.availability === "limited" ? "LIMITED AVAILABILITY" : "IN THE MAKING"}</span><span className="mono hero-index">01 — 06</span></div>
        <div className="hero-copy">
          <p className="hero-kicker">A practice in progress</p>
          <h1>Thoughtful work.<br /><span>Steady progress.</span></h1>
          <div className="hero-bottom">
            <p className="hero-summary">{settings?.introduction || "I’m Aalok Bhatta — a Civil Engineering graduate finding my way into software development, one thoughtful build at a time."}</p>
            <Link className="circle-link" to="/about" aria-label="Learn more about Aalok"><ArrowDownRight size={24} /></Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <div className="art-core"><span>A</span><i /></div>
          <div className="art-label art-label-top">CURIOSITY / 01</div><div className="art-label art-label-bottom">ENGINEERING A NEW PATH</div>
        </div>
        <div className="hero-bottomline"><span>SOFTWARE · SYSTEMS · THE WEB</span><span>EXPLORING & BUILDING WITH INTENTION</span><span>SCROLL TO EXPLORE <ArrowDownRight size={14} /></span></div>
      </section>

      <section className="intro-section section-shell section-space">
        <div className="section-label"><span className="mono">01</span><span>THE SHORT VERSION</span></div>
        <div className="intro-content">
          <p className="display-copy">A background in <em>building in the physical world.</em> A growing curiosity for building in the digital one.</p>
          <Link className="text-link" to="/about">A little more about me <ArrowUpRight size={16} /></Link>
        </div>
      </section>

      <section className="focus-section section-shell section-space">
        <div className="section-heading">
          <div><span className="eyebrow">WHERE MY CURIOSITY LEADS</span><h2>Areas I’m exploring<span className="accent">.</span></h2></div>
          <span className="mono section-aside">INTERESTS / NOT CLAIMS</span>
        </div>
        <div className="focus-list">
          {paths.map((path, index) => <div className="focus-row" key={path}><span className="mono">0{index + 1}</span><h3>{path}</h3><span className="focus-arrow"><ArrowUpRight size={20} /></span></div>)}
        </div>
      </section>

      <section className="projects-section section-shell section-space">
        <div className="section-heading">
          <div><span className="eyebrow">SELECTED WORK</span><h2>Things I’ve made<span className="accent">.</span></h2></div>
          <Link className="text-link" to="/projects">All projects <ArrowUpRight size={16} /></Link>
        </div>
        {loading ? <LoadState /> : error ? <LoadState error={error} /> : featured.length ? <div className="project-grid">
          {featured.map((project, index) => <Link className="project-card" to={`/projects/${project.slug}`} key={project._id}>
            <div className="project-visual">{project.imageUrl ? <img src={project.imageUrl} alt="" loading="lazy" /> : <div className={`project-placeholder placeholder-${index % 3}`}><span>{project.title.slice(0, 1)}</span><i>{project.category || "PROJECT"}</i></div>}<span className="project-open"><ArrowUpRight size={18} /></span></div>
            <div className="project-meta"><div><h3>{project.title}</h3><p>{project.summary}</p></div><span className="mono">{project.category || "BUILD"}</span></div>
            <div className="tag-row">{(project.technologies || []).slice(0, 4).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
          </Link>)}
        </div> : <EmptyState title="The work is taking shape">Projects will appear here as they’re ready to share. In the meantime, you can follow the learning journey in the journal.</EmptyState>}
      </section>

      <section className="note-section section-shell">
        <div className="note-inner"><span className="eyebrow">A NOTE ON THIS SPACE</span><p>This site is a living record of the things I’m learning, building, and thinking through. There’s more to come.</p><Link className="text-link text-link-light" to="/contact">Say hello <MoveUpRight size={16} /></Link><span className="note-decoration" aria-hidden="true">A</span></div>
      </section>
    </>
  );
}
