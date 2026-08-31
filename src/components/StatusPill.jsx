const tone = {
  Active: 'pill-green',
  Completed: 'pill-green',
  Refunded: 'pill-green',
  Frozen: 'pill-red',
  Failed: 'pill-red',
  Pending: 'pill-amber',
};

export default function StatusPill({ status }) {
  return <span className={`pill ${tone[status] || 'pill-emerald'}`}>{status}</span>;
}
