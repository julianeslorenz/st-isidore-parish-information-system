/** Vertical timeline. Each item: { content, meta, state: 'done' | 'current' | undefined }. */
export default function Timeline({ items, className = '' }) {
  return (
    <div className={`timeline ${className}`} role="list">
      {items.map((item, i) => (
        <div key={i} className="timeline-item" data-state={item.state} role="listitem">
          {item.content}
          {item.meta && <small className="block text-[12.5px] text-ink-3">{item.meta}</small>}
        </div>
      ))}
    </div>
  );
}
