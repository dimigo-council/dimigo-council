import styled, { css } from 'styled-components';

/** 보이지 않지만 스크린 리더와 키보드에는 남는 요소 */
export const visuallyHidden = css`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
`;

export const VisuallyHidden = styled.span`
  ${visuallyHidden}
`;
