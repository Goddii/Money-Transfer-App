// Parses backend-formatted monetary strings like "KES 1,234.00" or "1234.50"
// into a number. Backend returns several money fields pre-formatted; this
// strips the formatting so the UI can re-format for display while keeping the
// authoritative value.
export function parseMoney(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

// Format a numeric amount as Kenyan Shillings, e.g. formatKES(1234.5) ->
// "KES 1,234.50". Used consistently across the app for currency presentation.
export function formatKES(value, fractionDigits = 2) {
  const num = typeof value === 'number' ? value : parseMoney(value);
  if (!Number.isFinite(num)) return 'KES 0.00';
  return `KES ${num.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}
