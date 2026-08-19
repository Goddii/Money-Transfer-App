export default function StatCard({ label, value, delta, deltaTone = 'up' }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {delta && <div className={`stat-delta ${deltaTone}`}>{delta}</div>}
    </div>
  );
}
