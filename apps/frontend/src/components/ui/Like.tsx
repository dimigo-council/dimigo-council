import styled, { css } from 'styled-components';
import { Control, Icon } from '../../dimi-ui-kit/index.ts';
import { iconHeart } from '../../dimi-ui-kit/icons';

/* Figma ListRow의 "Like": kit Control Heart(24) + 공감 수, 사이 2 */
const Root = styled.span`
  ${({ theme: t }) => css`
    position: relative;
    z-index: 1;
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: ${t.spacing[50]};
    color: ${t.colors.core.glyph.primary};

    > span {
      ${t.text.footnoteRegular}
      color: ${t.colors.core.glyph.secondary};
      font-variant-numeric: tabular-nums;
    }
  `}
`;

export interface LikeProps {
  count: number;
  liked?: boolean;
  /** 없으면 수만 보여준다 (학생회 화면) */
  onToggle?: () => void;
  /** 무엇에 공감하는지 (스크린 리더용) */
  subject?: string;
}

/** 공감: 하트를 눌러 켜고 끄며, 옆에 공감 수가 보인다. */
export function Like({ count, liked = false, onToggle, subject }: LikeProps) {
  const name = subject ? `${subject} 공감` : '공감';
  return (
    <Root>
      {onToggle ? (
        <Control
          type="heart"
          checked={liked}
          onChange={onToggle}
          label={`${name} ${count}개`}
        />
      ) : (
        <Icon icon={iconHeart} size={24} label={`${name} ${count}개`} />
      )}
      <span aria-hidden="true">{count}</span>
    </Root>
  );
}
