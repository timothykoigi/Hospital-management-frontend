// Simple horizontal bar chart built with plain HTML/CSS (no chart library needed).
export default function BarList({ items, valueKey = "value", labelKey = "label", tone = "teal", empty = "No data yet." }) {
  const max = Math.max(1, ...items.map((i) => i[valueKey]));
  if (!items.length) return <p className="muted">{empty}</p>;
  return (
    <ul className="bar-list">
      {items.map((item) => (
        <li key={item[labelKey]}>
          <span className="bar-label">{item[labelKey]}</span>
          <span className="bar-track" aria-hidden="true">
            <span className={`bar-fill tone-${tone}`} style={{ width: `${(item[valueKey] / max) * 100}%` }} />
          </span>
          <span className="bar-value">{item[valueKey]}</span>
        </li>
      ))}
    </ul>
  );
}
