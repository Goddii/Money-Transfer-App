// Parses backend-formatted monetary strings like "$1,234.00" into a number.
// Backend returns several money fields pre-formatted; this strips the formatting
// so the UI can re-format for display while keeping the authoritative value.
export function parseMoney(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}
