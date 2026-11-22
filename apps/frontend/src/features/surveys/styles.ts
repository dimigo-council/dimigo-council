/* 설문 목록 · 설문 응답 (학생회 설문 미리보기·응답 보기도 함께 쓴다) */
import styled, { css } from 'styled-components';

/* ---------- 설문 카드 (설문 목록 · 홈 마감 임박 설문) ---------- */

/** Figma Grid: 384 카드 3열, 간격 24 */
export const SurveyGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing[550]};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const SurveyCardRoot = styled.article<{ $plain?: boolean }>`
  ${({ theme: t, $plain }) => css`
    display: flex;
    flex-direction: column;
    gap: ${t.spacing[400]};
    box-sizing: border-box;
    ${
      !$plain &&
      css`
        height: 100%;
        padding: ${t.spacing[550]};
        border: 1px solid ${t.colors.core.outline};
        border-radius: ${t.radius.m};
        background: ${t.colors.background.primary};
      `
    }
  `}
`;

export const SurveyCardTitle = styled.h3`
  ${({ theme: t }) => css`
    ${t.text.headlineStrong}
    margin: 0;
    color: ${t.colors.core.glyph.primary};
  `}
`;

export const SurveyCardIntro = styled.p`
  ${({ theme: t }) => css`
    ${t.text.calloutRegular}
    flex: 1;
    margin: 0;
    color: ${t.colors.core.glyph.secondary};
  `}
`;

export const SurveyRate = styled.div`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[200]};
  `}
`;

export const SurveyRateHead = styled.div`
  ${({ theme: t }) => css`
    ${t.text.footnoteRegular}
    display: flex;
    justify-content: space-between;
    color: ${t.colors.core.glyph.tertiary};

    > strong {
      ${t.text.footnoteStrong}
      color: ${t.colors.core.glyph.primary};
    }
  `}
`;

export const SurveyRateTrack = styled.div`
  ${({ theme: t }) => css`
    height: 6px;
    overflow: hidden;
    border-radius: ${t.radius.circle};
    background: ${t.colors.components.fill.secondary};
  `}
`;

export const SurveyRateBar = styled.div<{ $closed: boolean }>`
  ${({ theme: t, $closed }) => css`
    height: 100%;
    border-radius: inherit;
    background: ${
      $closed ? t.colors.components.fill.tertiary : t.colors.core.status.accent
    };
  `}
`;

export const SurveyCardMore = styled.div`
  display: flex;
  justify-content: center;
  margin-top: -4px;
`;

export const SurveyToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[550]};
`;

export const SurveyToolbarButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[300]};
`;

/** 목록 아래 "설문 기간이 아니어도 괜찮아요" */
export const SurveyInquiryCta = styled.section`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${t.spacing[500]};
    padding: ${t.spacing[600]} ${t.spacing[700]};
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};

    h2 {
      ${t.text.bodyStrong}
      margin: 0 0 ${t.spacing[100]};
      color: ${t.colors.core.glyph.primary};
    }
    p {
      ${t.text.calloutRegular}
      margin: 0;
      color: ${t.colors.core.glyph.secondary};
    }
  `}
`;

/* ---------- 응답 화면 (Figma 학생 / 설문 참여) ---------- */

/** 설문 카드: 안쪽 32, 모든 줄 사이 20 */
export const SurveySheet = styled.form`
  ${({ theme: t }) => css`
    display: flex;
    flex-direction: column;
    gap: ${t.spacing[500]};
    padding: ${t.spacing[700]};
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};

    @media (max-width: 600px) {
      padding: ${t.spacing[500]};
    }
  `}
`;

export const SurveyMeta = styled.p`
  ${({ theme: t }) => css`
    ${t.text.footnoteRegular}
    margin: 0;
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

export const SurveyTitle = styled.h2`
  ${({ theme: t }) => css`
    ${t.text.titleStrong}
    margin: 0;
    color: ${t.colors.core.glyph.primary};
  `}
`;

export const SurveyLead = styled.p`
  ${({ theme: t }) => css`
    ${t.text.paragraphLarge}
    margin: 0;
    color: ${t.colors.core.glyph.secondary};
  `}
`;

/** 문항 하나: 제목과 선택지 사이도 카드와 같은 20 */
export const Question = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-direction: column;
    gap: ${t.spacing[500]};
    min-width: 0;
  `}
`;

export const QuestionHeading = styled.div`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[150]};

    > span:first-child {
      ${t.text.headlineStrong}
      color: ${t.colors.core.glyph.primary};
    }
    > span + span {
      ${t.text.footnoteRegular}
      color: ${t.colors.core.glyph.secondary};
    }
  `}
`;

export const QuestionError = styled.p`
  ${({ theme: t }) => css`
    ${t.text.footnoteRegular}
    margin: 0;
    color: ${t.colors.core.status.negative};
  `}
`;

/** 이전 · 다음 문항 (120 · 160) */
export const SurveyActions = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    gap: ${t.spacing[300]};

    > :first-child {
      min-width: 120px;
    }
    > :last-child {
      min-width: 160px;
    }
  `}
`;

export const SurveyNote = styled.p`
  ${({ theme: t }) => css`
    ${t.text.paragraphLarge}
    margin: 0;
    color: ${t.colors.core.glyph.secondary};
  `}
`;

/** 답변 확인: 문항별 내 답 */
export const ReviewList = styled.dl`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[500]};
    margin: 0;

    > div {
      display: grid;
      gap: ${t.spacing[200]};
      padding-bottom: ${t.spacing[500]};
      border-bottom: 1px solid ${t.colors.core.line};
    }
    > div:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }
    dt {
      ${t.text.headlineStrong}
      color: ${t.colors.core.glyph.primary};
    }
    dd {
      ${t.text.paragraphLarge}
      margin: 0;
      color: ${t.colors.core.glyph.secondary};
      white-space: pre-wrap;
    }
  `}
`;
