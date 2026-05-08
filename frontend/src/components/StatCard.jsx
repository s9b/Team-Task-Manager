import './StatCard.css';

export default function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: accent || 'var(--color-primary)' }}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
