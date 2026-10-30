import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PageMeta from "../components/PageMeta.jsx";

export default function NotFound() {
  return <section className="not-found section-shell"><PageMeta title="Page not found" /><span className="mono">404 / PAGE NOT FOUND</span><h1>Looks like a<br /><span>wrong turn.</span></h1><p>The page you’re looking for may have moved or may not exist yet.</p><Link className="button button-dark" to="/"><ArrowLeft size={17} /> Back home</Link></section>;
}
