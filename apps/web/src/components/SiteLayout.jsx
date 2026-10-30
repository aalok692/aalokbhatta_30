import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowUp, Github, Linkedin, Menu, Moon, Sun, X } from "lucide-react";
import useResource from "../lib/useResource.js";

const navigation = [
  ["/about", "About"],
  ["/projects", "Projects"],
  ["/gallery", "Gallery"],
  ["/journal", "Journal"]
];

export default function SiteLayout() {
  const { data: site } = useResource("/public/settings");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [showTop, setShowTop] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 560);
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="wordmark" to="/" aria-label="Aalok Bhatta home">
            <span className="wordmark-mark">A</span><span>aalok<span className="wordmark-dot">.</span></span>
          </Link>
          <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
            {navigation.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{label}</NavLink>
            ))}
            <NavLink to="/contact" className="nav-contact">Let&apos;s talk <span aria-hidden="true">↗</span></NavLink>
          </nav>
          <div className="header-actions">
            <button className="icon-button theme-toggle" type="button" aria-label={`Switch to ${dark ? "light" : "dark"} theme`} onClick={() => setDark(!dark)}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="icon-button menu-toggle" type="button" aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      <main id="main"><Outlet /></main>
      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <Link className="wordmark footer-wordmark" to="/"><span className="wordmark-mark">A</span><span>aalok<span className="wordmark-dot">.</span></span></Link>
            <p className="footer-note">Building a thoughtful path into software.</p>
          </div>
          <div className="footer-right">
            <span className="eyebrow">FIND ME ELSEWHERE</span>
            <div className="social-links">
              {site?.socialLinks?.github && <a href={site.socialLinks.github} target="_blank" rel="noreferrer"><Github size={17} /> GitHub <span>↗</span></a>}
              {site?.socialLinks?.linkedin && <a href={site.socialLinks.linkedin} target="_blank" rel="noreferrer"><Linkedin size={17} /> LinkedIn <span>↗</span></a>}
              {site?.socialLinks?.email && <a href={`mailto:${site.socialLinks.email}`}>Email <span>↗</span></a>}
              {!site?.socialLinks?.github && !site?.socialLinks?.linkedin && !site?.socialLinks?.email && <span className="muted-small">Add public links from the admin dashboard.</span>}
            </div>
          </div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Aalok Bhatta</span><span>Made with intention · aalokbhatta.com</span></div>
      </footer>
      {showTop && <button className="back-top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><ArrowUp size={18} /></button>}
    </>
  );
}
