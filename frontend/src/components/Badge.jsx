import './Badge.css';

const STATUS_STYLES = {
  TODO: { label: 'To Do', className: 'badge-todo' },
  IN_PROGRESS: { label: 'In Progress', className: 'badge-in-progress' },
  DONE: { label: 'Done', className: 'badge-done' },
};

const PRIORITY_STYLES = {
  LOW: { label: 'Low', className: 'badge-low' },
  MEDIUM: { label: 'Medium', className: 'badge-medium' },
  HIGH: { label: 'High', className: 'badge-high' },
};

const ROLE_STYLES = {
  ADMIN: { label: 'Admin', className: 'badge-admin' },
  MEMBER: { label: 'Member', className: 'badge-member' },
};

export default function Badge({ type, value }) {
  let map;
  if (type === 'status') map = STATUS_STYLES;
  else if (type === 'priority') map = PRIORITY_STYLES;
  else if (type === 'role') map = ROLE_STYLES;
  else return null;

  const entry = map[value];
  if (!entry) return <span className="badge">{value}</span>;

  return <span className={`badge ${entry.className}`}>{entry.label}</span>;
}
