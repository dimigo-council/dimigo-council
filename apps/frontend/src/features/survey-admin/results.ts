/**
 * 설문 결과 표시 (기능 명세서 SRV-R2, Figma 학생회 / 설문 결과).
 * 문항별 분석은 서버가 하고(GET /surveys/:id/results), 여기서는 표시만 한다.
 */

/** 0.553 → 55% */
export function formatRatio(ratio: number) {
  return `${Math.round(ratio * 100)}%`;
}
