import { capitalize } from "../utils/format";

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{capitalize(status)}</span>;
}

export function ActiveBadge({ active }) {
  return <span className={`badge ${active ? "badge-approved" : "badge-cancelled"}`}>{active ? "Active" : "Inactive"}</span>;
}
