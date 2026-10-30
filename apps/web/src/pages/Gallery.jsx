import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import PageMeta from "../components/PageMeta.jsx";
import { EmptyState, LoadState } from "../components/States.jsx";
import useResource from "../lib/useResource.js";

export default function Gallery() {
  const { data, loading, error } = useResource("/public/gallery");
  const [active, setActive] = useState(-1);
  const [category, setCategory] = useState("All");
  const closeButton = useRef(null);
  const openerButton = useRef(null);
  const items = data?.items ?? [];
  const categories = ["All", ...new Set(items.map((item) => item.category).filter(Boolean))];
  const filtered = items.filter((item) => category === "All" || item.category === category);
  function move(direction) {
    setActive((current) => (current + direction + filtered.length) % filtered.length);
  }
  useEffect(() => {
    if (active < 0) return undefined;
    closeButton.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setActive(-1);
      if (event.key === "ArrowLeft" && filtered.length > 1) move(-1);
      if (event.key === "ArrowRight" && filtered.length > 1) move(1);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      openerButton.current?.focus();
    };
  }, [active, filtered.length]);
  return (
    <>
      <PageMeta title="Gallery" description="A personal gallery by Aalok Bhatta. Photographs will be added when ready." />
      <section className="page-hero section-shell page-hero-compact">
        <div className="eyebrow"><span className="mono">COLLECTED / 03</span> MOMENTS & DETAILS</div>
        <h1>A place for<br /><span>seeing slowly.</span></h1>
        <p className="page-lede">A visual notebook for places, details, and moments worth keeping. Personal photographs will find their way here in time.</p>
      </section>
      <section className="section-shell listing-section">
        {categories.length > 1 && <div className="filter-list gallery-filter">{categories.map((item) => <button key={item} className={category === item ? "filter-chip selected" : "filter-chip"} onClick={() => setCategory(item)}>{item}</button>)}</div>}
        {loading ? <LoadState /> : error ? <LoadState error={error} /> : filtered.length ? <div className="gallery-grid">
          {filtered.map((image, index) => <button className={`gallery-item gallery-item-${index % 5}`} key={image._id} onClick={(event) => { openerButton.current = event.currentTarget; setActive(index); }} aria-label={`View ${image.title || image.caption || "gallery photograph"}`}>
            <picture>
              {image.thumbnailUrl && <source media="(max-width: 680px)" srcSet={image.thumbnailUrl} />}
              <img src={image.imageUrl} alt={image.alt || image.caption || ""} loading="lazy" />
            </picture>
            <span className="gallery-caption"><span>{image.title || image.caption}</span><span>{image.category}</span></span>
          </button>)}
        </div> : <EmptyState title="The gallery is waiting for its first photograph">No stock images here—this space is reserved for real moments and photographs added by Aalok.</EmptyState>}
      </section>
      {active >= 0 && filtered[active] && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Gallery image viewer" onClick={(event) => { if (event.target === event.currentTarget) setActive(-1); }}>
        <button ref={closeButton} className="lightbox-close" onClick={() => setActive(-1)} aria-label="Close image viewer"><X /></button>
        {filtered.length > 1 && <button className="lightbox-arrow lightbox-prev" onClick={() => move(-1)} aria-label="Previous image"><ArrowLeft /></button>}
        <figure><img src={filtered[active].imageUrl} alt={filtered[active].alt || filtered[active].caption || ""} /><figcaption><strong>{filtered[active].caption || filtered[active].title}</strong>{filtered[active].description && <span>{filtered[active].description}</span>}</figcaption></figure>
        {filtered.length > 1 && <button className="lightbox-arrow lightbox-next" onClick={() => move(1)} aria-label="Next image"><ArrowRight /></button>}
      </div>}
    </>
  );
}
