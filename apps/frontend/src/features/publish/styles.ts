/* 업무공간 공개 검토 */
import styled, { css } from 'styled-components';
import { InputBox } from '../../dimi-ui-kit/index.ts';
import { commentInput, ListRowExcerpt } from '../../components/ui/index.ts';

export const PublishPanel = styled.div`
  display: grid;
  gap: 16px;
  margin-top: 20px;
`;

export const PublishPanelNote = styled.p`
  margin: -8px 0 0;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

/** 공개 검토에서는 미리보기를 줄이지 않는다 */
export const PublishPreview = styled(ListRowExcerpt)`
  -webkit-line-clamp: unset;
  line-clamp: none;
`;

export const PublishNote = styled.p`
  ${({ theme: t }) => css`
    flex-basis: 100%;
    margin: 0;
    color: ${t.colors.core.status.negative};
    font-size: ${t.font.size.callout};
    line-height: 1.6;

    strong {
      margin-right: 4px;
    }
  `}
`;

export const PublishRevise = styled.form`
  display: grid;
  flex-basis: 100%;
  gap: 8px;

  > ${InputBox} {
    ${commentInput}
  }
`;
