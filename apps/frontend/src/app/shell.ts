/* 앱 셸 공용: 학생 화면(GNB)과 업무공간(사이드바)이 함께 쓰는 조각. */
import { Link } from 'react-router';
import styled, { createGlobalStyle, css } from 'styled-components';

export const AppGlobalStyle = createGlobalStyle`
  html,
  body {
    overflow-x: clip;
  }

  main:focus {
    outline: none;
  }
`;

/** 한국어는 어절 단위로 줄바꿈하고, 긴 영단어·URL만 강제로 끊는다. */
export const koreanWrap = css`
  word-break: keep-all;
  overflow-wrap: break-word;
`;

export const SkipLink = styled.a`
  ${({ theme: t }) => css`
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 10;
    padding: 8px 12px;
    border-radius: ${t.radius.m};
    background: ${t.colors.components.fill.inverted.primary};
    color: ${t.colors.core.glyph.inverted.primary};
    font-size: ${t.font.size.callout};
    font-weight: 700;
    transform: translateY(-200%);

    &:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: 2px;
      transform: none;
    }
  `}
`;

export const ShellBrand = styled(Link)`
  ${({ theme: t }) => css`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: ${t.colors.core.glyph.primary};
    font-size: ${t.font.size.body};
    font-weight: 800;
    text-decoration: none;
    white-space: nowrap;

    &:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: 4px;
    }
  `}
`;

/** 셸 바깥 단독 화면 (로그인, 404) */
export const StandaloneMain = styled.main`
  ${koreanWrap}
  width: min(100% - 32px, 640px);
  margin: 80px auto;
`;
