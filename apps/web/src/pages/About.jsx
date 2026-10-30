import { ArrowUpRight, Compass, Layers3, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageMeta from "../components/PageMeta.jsx";
import useResource from "../lib/useResource.js";

const principles = [
  ["01", "Stay curious", "The best work starts with a willingness to ask better questions and learn beyond the familiar."],
  ["02", "Build with care", "Good engineering is not only about making things work. It is also about clarity, reliability, and the people using them."],
  ["03", "Keep moving", "A career change is a journey made from small, consistent steps—not a single leap."]
];

export default function About() {
  const { data: settings } = useResource("/public/settings");
  return (
    <>
      <PageMeta title="About" description="The story of Aalok Bhatta: a Civil Engineering background and a growing journey into software development." />
      <section className="page-hero section-shell">
        <div className="eyebrow"><span className="mono">ABOUT / 01</span> A WORK IN PROGRESS</div>
        <h1>Different discipline.<br /><span>Same instinct to build.</span></h1>
        <p className="page-lede">I’m Aalok Bhatta. My path started in Civil Engineering and is now leading me toward software—where I’m learning to make useful things in a different medium.</p>
      </section>
      <section className="about-story section-shell section-space">
        <div className="section-label"><span className="mono">01</span><span>THE JOURNEY SO FAR</span></div>
        <div className="story-copy">
          <p className="story-lead">I’m drawn to the process of turning a problem into something real.</p>
          <p>{settings?.about?.background || "Civil Engineering gave me a starting point in the built world. As my interests expanded, I became curious about the systems behind the tools we use every day—and about how software can solve problems at a different scale."}</p>
          <p>{settings?.about?.journey || "That curiosity has grown into a transition toward software development. I’m exploring full-stack development, backend engineering, cloud, and DevOps, building my understanding one concept and project at a time."}</p>
          {settings?.about?.education && <p><strong>Education:</strong> {settings.about.education}</p>}
          {settings?.about?.experience && <p><strong>Experience:</strong> {settings.about.experience}</p>}
          {settings?.about?.goals && <p>{settings.about.goals}</p>}
          <p>This site is part portfolio, part notebook: a place to share what I make and document how I’m learning. I’m still defining the next chapter, and I want the work here to reflect that honestly.</p>
        </div>
      </section>
      <section className="journey-strip">
        <div className="section-shell journey-inner">
          <div><span className="eyebrow">FROM STRUCTURES TO SYSTEMS</span><h2>A new medium.<br /><span>A familiar curiosity.</span></h2></div>
          <div className="journey-icons"><div><Compass size={23} /><span>EXPLORE</span></div><MoveRight size={23} /><div><Layers3 size={23} /><span>BUILD</span></div></div>
        </div>
      </section>
      <section className="principles-section section-shell section-space">
        <div className="section-heading"><div><span className="eyebrow">WHAT GUIDES ME</span><h2>Principles, not shortcuts<span className="accent">.</span></h2></div><span className="mono section-aside">AN ONGOING PRACTICE</span></div>
        <div className="principles-list">{principles.map(([number, title, copy]) => <article className="principle-row" key={number}><span className="mono">{number}</span><h3>{title}</h3><p>{copy}</p><ArrowUpRight size={18} /></article>)}</div>
      </section>
      <section className="about-cta section-shell"><p>Want to see what I’m working on?</p><div className="about-cta-links"><Link to="/projects" className="text-link">Explore the projects <ArrowUpRight size={16} /></Link>{settings?.resumeUrl && <a href={settings.resumeUrl} className="text-link" target="_blank" rel="noreferrer">Download résumé <ArrowUpRight size={16} /></a>}</div></section>
    </>
  );
}
