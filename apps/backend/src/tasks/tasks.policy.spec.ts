import { logKindFor } from './tasks.policy.ts';

describe('logKindFor', () => {
  it('maps a hand-written record to a 진행 기록 유형', () => {
    expect(logKindFor('완료')).toBe('완료');
    expect(logKindFor('검토 요청')).toBe('진행 중');
    expect(logKindFor('진행 중')).toBe('진행 중');
    expect(logKindFor(undefined)).toBe('수정');
  });
});
