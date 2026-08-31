import { describe, it, expect } from 'vitest';
import { parseMoney, formatKES } from '../utils/format';

describe('format helpers', () => {
  it('parseMoney strips currency formatting to a number', () => {
    expect(parseMoney('KES 1,234.50')).toBe(1234.5);
    expect(parseMoney('$1,234.00')).toBe(1234);
    expect(parseMoney(50)).toBe(50);
    expect(parseMoney('not a number')).toBe(0);
  });

  it('formatKES renders Kenyan Shillings with grouping', () => {
    expect(formatKES(1234.5)).toBe('KES 1,234.50');
    expect(formatKES(0)).toBe('KES 0.00');
    expect(formatKES('KES 999.00')).toBe('KES 999.00');
  });
});
