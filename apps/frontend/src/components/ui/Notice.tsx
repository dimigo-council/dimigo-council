import type { HTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { Icon, IconSvg } from '../../dimi-ui-kit/index.ts';
import { iconExclamation, iconInfo } from '../../dimi-ui-kit/icons.ts';

export type NoticeTone = 'info' | 'warn' | 'neutral';

export interface NoticeProps extends HTMLAttributes<HTMLDivElement> {
  tone?: NoticeTone;
  children: ReactNode;
}

const NoticeRoot = styled.div<{ $tone: NoticeTone }>`
  ${({ theme: t, $tone }) => {
    const c = t.colors;
    const tones = {
      info: css`
        background: ${c.core.status.translucent.info};
        color: ${c.core.glyph.primary};
        > ${IconSvg} {
          color: ${c.core.status.info};
        }
      `,
      warn: css`
        background: ${c.core.status.translucent.accent};
        color: ${c.core.glyph.primary};
        > ${IconSvg} {
          color: ${c.core.status.accent};
        }
      `,
      neutral: css`
        background: ${c.components.fill.primary};
        box-shadow: inset 0 0 0 1px ${c.core.outline};
        color: ${c.core.glyph.secondary};
      `,
    };
    return css`
      display: flex;
      align-items: flex-start;
      gap: ${t.spacing[200]};
      padding: ${t.spacing[300]} ${t.spacing[400]};
      border-radius: ${t.radius.m};
      font-size: ${t.font.size.callout};
      line-height: ${t.font.lineHeight.callout};

      > ${IconSvg} {
        margin-block: calc((${t.font.lineHeight.callout} - 20px) / 2);
      }
      ${tones[$tone]}
    `;
  }}
`;

const NoticeBody = styled.div`
  min-width: 0;
`;

/** 화면 안의 안내 문구. info: 알아둘 사실, warn: 주의, neutral: 덧붙이는 설명 */
export function Notice({ tone = 'info', children, ...rest }: NoticeProps) {
  return (
    <NoticeRoot $tone={tone} {...rest}>
      <Icon icon={tone === 'warn' ? iconExclamation : iconInfo} size={20} />
      <NoticeBody>{children}</NoticeBody>
    </NoticeRoot>
  );
}
