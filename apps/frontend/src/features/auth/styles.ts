/* 로그인 · 회원가입: Figma 공통 / 로그인 · 회원가입 */
import styled, { css } from 'styled-components';
import { ButtonRoot } from '../../dimi-ui-kit/index.ts';

/** 가운데 440 카드. 위아래 40, 좌우 24, 자식 사이 24 */
export const AuthCard = styled.section`
  ${({ theme: t }) => css`
    display: flex;
    flex-direction: column;
    gap: ${t.spacing[550]};
    align-self: center;
    box-sizing: border-box;
    width: min(100%, 440px);
    padding: ${t.spacing[800]} ${t.spacing[550]};
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};
  `}
`;

export const AuthForm = styled.form`
  display: contents;
`;

/** kit InputField와 같은 좌우 16 들여쓰기 */
export const Inset = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-direction: column;
    gap: ${t.spacing[200]};
    padding: 0 ${t.spacing[400]};
  `}
`;

export const AuthHeading = styled(Inset)`
  ${({ theme: t }) => css`
    h1 {
      ${t.text.titleStrong}
      margin: 0;
      color: ${t.colors.core.glyph.primary};
    }
    p {
      ${t.text.bodyRegular}
      margin: 0;
      color: ${t.colors.core.glyph.secondary};
      white-space: pre-line;
    }
  `}
`;

/** Google 버튼: 로고는 왼쪽 끝, 글자는 가운데 */
export const GoogleSlot = styled(Inset)`
  ${({ theme: t }) => css`
    ${ButtonRoot} {
      position: relative;
    }
    ${ButtonRoot} > svg:first-child {
      position: absolute;
      left: ${t.spacing[500]};
    }
  `}
`;

/** "아직 계정이 없나요? 회원가입" */
export const AuthSwitch = styled.p`
  ${({ theme: t }) => css`
    ${t.text.calloutRegular}
    display: flex;
    justify-content: center;
    align-items: center;
    gap: ${t.spacing[200]};
    margin: 0;
    color: ${t.colors.core.glyph.secondary};
  `}
`;

/** "이메일 변경 · N초 후 다시 받기" */
export const AuthLinks = styled(Inset)`
  flex-direction: row;
  justify-content: space-between;
`;

/** 체크박스 한 줄 (학년·반·성별 입력, 약관 동의) */
export const CheckRow = styled(Inset)`
  ${({ theme: t }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${t.spacing[300]};

    > label {
      flex: 1;
      gap: ${t.spacing[300]};
      min-height: 0;
    }
  `}
`;

export const CheckRows = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[300]};
`;

/** 성별처럼 kit InputField 모양을 따르는 선택 줄 */
export const SegmentField = styled(Inset)`
  ${({ theme: t }) => css`
    > span {
      ${t.text.calloutRegular}
      color: ${t.colors.core.glyph.secondary};
    }
  `}
`;

export const AuthError = styled.p`
  ${({ theme: t }) => css`
    ${t.text.footnoteRegular}
    margin: 0;
    padding: 0 ${t.spacing[400]};
    color: ${t.colors.core.status.negative};
  `}
`;
