import styled from 'styled-components';
// 셸에는 로고 한 장만 쓰므로 kit BrandMark(모든 로고를 싣는다) 대신 파일 하나만 불러온다.
import logoSvg from '../dimi-ui-kit/brand/logo-council-color-32.svg?raw';

const Root = styled.span`
  display: inline-flex;
  flex: none;
  height: 32px;

  > svg {
    display: block;
    width: auto;
    height: 100%;
  }

  ${({ theme }) =>
    theme.mode === 'dark' &&
    `svg path[fill="#20202E"] { fill: ${theme.colors.core.glyph.primary}; }`}
`;

/** GNB·푸터의 학생자치회 로고 (kit Logo/COUNCIL color 32) */
export function BrandLogo({ label }: { label?: string }) {
  return (
    <Root
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      // 저장소에 있는 kit 내보내기 파일이다. 사용자 입력이 아니다.
      dangerouslySetInnerHTML={{ __html: logoSvg }}
    />
  );
}
