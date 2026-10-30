export function LoadState({ error }) {
  return <div className="notice-state" role="status">{error ? `Could not load this content: ${error}` : "Loading…"}</div>;
}

export function EmptyState({ title, children }) {
  return <div className="empty-state"><span className="empty-mark">—</span><h3>{title}</h3><p>{children}</p></div>;
}
