import {
  addDays,
  daysUntil,
  startOfSeoulMonth,
  todayInSeoul,
} from './dates.ts';
import { withIGa, withRo } from './korean.ts';
import { pgErrorCode } from './database-errors.ts';

describe('dates', () => {
  it('uses the Seoul calendar', () => {
    // 2026-11-20 23:30 in UTC is already 11-21 in Seoul.
    const now = new Date('2026-11-20T23:30:00Z');
    expect(todayInSeoul(now)).toBe('2026-11-21');
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(startOfSeoulMonth(now).toISOString()).toBe(
      '2026-10-31T15:00:00.000Z',
    );
    expect(daysUntil(new Date('2026-11-23T03:00:00Z'), now)).toBe(2);
  });
});

describe('korean particles', () => {
  it('picks 이/가 and 으로/로', () => {
    expect(withIGa('이서연')).toBe('이서연이');
    expect(withIGa('안지호')).toBe('안지호가');
    expect(withRo('정민준')).toBe('정민준으로');
    expect(withRo('안지호')).toBe('안지호로');
    expect(withRo('서울')).toBe('서울로');
  });
});

describe('pgErrorCode', () => {
  it('reads the code from a wrapped driver error', () => {
    expect(pgErrorCode({ cause: { code: '23505' } })).toBe('23505');
    expect(pgErrorCode(new Error('plain'))).toBeUndefined();
  });
});
