import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
} from 'react-router';
import styled, { css } from 'styled-components';
import { ButtonLink, PersonAvatar } from '../components/ui/index.ts';
import { IconButton, Icon } from '../dimi-ui-kit/index.ts';
import { BrandLogo } from './BrandMark.tsx';
import {
  iconKeyboardArrowDown,
  iconLink,
  iconNotifications,
  iconSearch,
} from '../dimi-ui-kit/icons';
import { logout, useSession } from './session.ts';
import { koreanWrap, SkipLink } from './shell.ts';

/**
 * 화면 모드. GNB 메뉴가 권한에 따라 달라진다 (기능 명세서 1. GNB).
 * student: 학생 화면, council: 학생회 화면(/work), visitor: 로그인 전 랜딩.
 */
export type AppMode = 'student' | 'council' | 'visitor';

interface NavItem {
  to: string;
  label: string;
  /** 하위 경로에서도 현재 메뉴로 표시하지 않는다 (홈) */
  end?: boolean;
}

const studentNav: NavItem[] = [
  { to: '/', label: '홈', end: true },
  { to: '/activities', label: '활동' },
  { to: '/surveys', label: '설문' },
  { to: '/inquiries', label: '질문과 건의' },
  { to: '/records', label: '활동 기록' },
];

const councilNav: NavItem[] = [
  { to: '/work', label: '홈', end: true },
  { to: '/work/activities', label: '활동' },
  { to: '/work/tasks', label: '업무' },
  { to: '/work/surveys', label: '설문' },
  { to: '/work/inquiries', label: '질문과 건의' },
  { to: '/work/records', label: '활동 기록' },
];

const narrow = '@media (max-width: 860px)';
/** 로고·메뉴·동작이 한 줄에 들어가지 않으면 메뉴를 다음 줄로 내린다. */
const gnbWrap = '@media (max-width: 1180px)';

const contentColumn = css`
  width: min(100% - 32px, 1200px);
  margin-inline: auto;
`;

const Shell = styled.div`
  ${koreanWrap}
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${({ theme }) => theme.colors.background.secondary};
`;

const Gnb = styled.header`
  ${({ theme: t }) => css`
    position: sticky;
    top: 0;
    z-index: 5;
    border-bottom: 1px solid ${t.colors.core.outline};
    background: ${t.colors.background.primary};

    @media print {
      display: none;
    }
  `}
`;

const GnbInner = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
  min-height: 72px;
  padding-inline: 40px;

  ${gnbWrap} {
    flex-wrap: wrap;
    gap: 0 16px;
    padding: 8px 16px 0;
  }
`;

const Brand = styled(Link)`
  display: inline-flex;
  flex: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.core.status.accent};
    outline-offset: 4px;
  }
  ${narrow} {
    max-width: 240px;
    overflow: hidden;
  }
`;

const GnbNav = styled.nav`
  display: flex;
  align-self: stretch;
  gap: ${({ theme }) => theme.spacing[700]};
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
  ${gnbWrap} {
    order: 2;
    flex-basis: 100%;
    min-height: 48px;
  }
`;

const GnbLink = styled(NavLink)`
  ${({ theme: t }) => css`
    ${t.text.bodyRegular}
    display: inline-flex;
    flex: none;
    align-items: center;
    color: ${t.colors.core.glyph.primary};
    text-decoration: none;
    white-space: nowrap;

    &:hover {
      color: ${t.colors.core.status.accent};
    }
    &[aria-current='page'] {
      ${t.text.bodyStrong}
      color: ${t.colors.core.status.accent};
    }
    &:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: -2px;
    }
  `}
`;

const GnbActions = styled.div<{ $visitor?: boolean }>`
  ${({ theme: t, $visitor }) => css`
    display: flex;
    align-items: center;
    gap: ${$visitor ? t.spacing[300] : t.spacing[400]};
    margin-left: auto;

    ${gnbWrap} {
      order: 1;
    }
  `}
`;

const GnbSeparator = styled.span`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.colors.core.line};
`;

/** Figma TopNav의 검색·알림. 검색은 kit IconButton Badged에서 점을 숨긴 모양이다. */
const GnbIcons = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[200]};

  > button:first-child > span {
    display: none;
  }
`;

const Profile = styled.details`
  ${({ theme: t }) => css`
    position: relative;

    > summary {
      display: flex;
      align-items: center;
      gap: ${t.spacing[200]};
      border-radius: ${t.radius.m};
      list-style: none;
      cursor: pointer;
    }
    > summary::-webkit-details-marker {
      display: none;
    }
    > summary:hover {
      background: ${t.colors.components.interaction.hover};
    }
    > summary:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
    }
  `}
`;

const ProfileText = styled.span`
  ${({ theme: t }) => css`
    display: grid;
    color: ${t.colors.core.glyph.primary};

    > strong {
      ${t.text.calloutStrong}
    }
    > span {
      ${t.text.footnoteWeak}
      color: ${t.colors.core.glyph.tertiary};
    }

    ${narrow} {
      display: none;
    }
  `}
`;

const ProfileMenu = styled.div`
  ${({ theme: t }) => css`
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    display: grid;
    min-width: 180px;
    padding: ${t.spacing[200]};
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.l};
    background: ${t.colors.background.primary};
    box-shadow: 0 8px 24px ${t.colors.core.shadow};

    > a,
    > button {
      ${t.text.calloutRegular}
      padding: ${t.spacing[200]} ${t.spacing[300]};
      border: 0;
      border-radius: ${t.radius.s};
      background: none;
      color: ${t.colors.core.glyph.primary};
      text-align: left;
      text-decoration: none;
      cursor: pointer;
    }
    > a:hover,
    > button:hover {
      background: ${t.colors.components.interaction.hover};
    }
  `}
`;

/** 다음 화면을 불러오는 동안 GNB 아래에 보이는 막대 */
const LoadingBar = styled.div`
  ${({ theme: t }) => css`
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 2px;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      width: 40%;
      background: ${t.colors.core.status.accent};
      animation: gnb-loading 1s ease-in-out infinite;
    }
    @keyframes gnb-loading {
      from {
        transform: translateX(-100%);
      }
      to {
        transform: translateX(250%);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      &::after {
        width: 100%;
        animation: none;
        opacity: 0.5;
      }
    }
  `}
`;

/** Figma Body: 위 40, 아래 80, 자식 사이 24 */
const Main = styled.main`
  ${contentColumn}
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[550]};
  flex: 1;
  padding-block: ${({ theme }) => `${theme.spacing[800]} ${theme.spacing[1000]}`};

  ${narrow} {
    padding-block: 28px 56px;
  }
`;

const Footer = styled.footer`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[700]};
    padding-block: ${t.spacing[850]};
    border-top: 1px solid ${t.colors.core.line};
    background: ${t.colors.background.primary};
    color: ${t.colors.core.glyph.secondary};

    @media print {
      display: none;
    }
  `}
`;

const FooterTop = styled.div`
  ${contentColumn}
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[700]};
`;

const FooterDivider = styled.hr`
  ${contentColumn}
  height: 1px;
  margin-block: 0;
  border: 0;
  background: ${({ theme }) => theme.colors.core.line};
`;

const FooterInfo = styled.div`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[400]};

    > div {
      display: grid;
      gap: ${t.spacing[100]};
      ${t.text.footnoteRegular}
    }
    p {
      margin: 0;
    }
    p:last-child {
      color: ${t.colors.core.glyph.tertiary};
    }
  `}
`;

const FooterLinks = styled.nav`
  ${({ theme: t }) => css`
    display: grid;
    align-content: start;
    gap: ${t.spacing[300]};
    ${t.text.footnoteRegular}

    > h2 {
      ${t.text.footnoteStrong}
      margin: 0;
      color: ${t.colors.core.glyph.primary};
    }
    > div {
      display: grid;
      justify-items: start;
      gap: ${t.spacing[100]};
    }
    a {
      display: inline-flex;
      align-items: center;
      gap: ${t.spacing[100]};
      color: ${t.colors.core.glyph.primary};
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  `}
`;

const FooterBottom = styled.div`
  ${({ theme: t }) => css`
    ${contentColumn}
    ${t.text.captionRegular}
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${t.spacing[300]};
    color: ${t.colors.core.glyph.tertiary};

    > nav {
      display: flex;
      gap: ${t.spacing[400]};
    }
    a {
      ${t.text.footnoteRegular}
      color: ${t.colors.core.glyph.primary};
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  `}
`;

// TODO: 관련 사이트 주소는 학생회에 확인한다.
const relatedSites = [
  { label: '한국디지털미디어고등학교', href: 'https://www.dimigo.hs.kr' },
  { label: '디미고인', href: 'https://dimigo.in' },
  { label: '디미위키', href: 'https://dimigo.wiki' },
];

function SiteFooter() {
  return (
    <Footer>
      <FooterTop>
        <FooterInfo>
          <BrandLogo label="한국디지털미디어고등학교 학생자치회" />
          <div>
            <p>한국디지털미디어고등학교 25대 학생자치회 / 제작: 조원(24HD)</p>
            <p>문의: me@trillion-won.com</p>
          </div>
        </FooterInfo>
        <FooterLinks aria-labelledby="related-sites">
          <h2 id="related-sites">관련 사이트</h2>
          <div>
            {relatedSites.map((site) => (
              <a
                key={site.href}
                href={site.href}
                target="_blank"
                rel="noreferrer"
              >
                {site.label}
                <Icon icon={iconLink} size={16} />
              </a>
            ))}
          </div>
        </FooterLinks>
      </FooterTop>
      <FooterDivider />
      <FooterBottom>
        <span>
          © 2026. Korea Digital Media High School Student Council. All rights
          reserved.
        </span>
        <nav aria-label="약관">
          <Link to="/privacy">개인정보처리방침</Link>
          <Link to="/terms">이용약관</Link>
        </nav>
      </FooterBottom>
    </Footer>
  );
}

function ProfileButton({ mode }: { mode: 'student' | 'council' }) {
  const session = useSession();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onLogout = async () => {
    await logout();
    await navigate('/login', { replace: true });
  };
  return (
    // 다른 화면으로 가면 메뉴를 닫는다.
    <Profile key={pathname}>
      <summary>
        <PersonAvatar name={session.name} size="medium" aria-hidden="true" />
        <ProfileText>
          <strong>{session.name}</strong>
          <span>
            {mode === 'council' ? session.councilRole : session.affiliation}
          </span>
        </ProfileText>
        <Icon icon={iconKeyboardArrowDown} size={20} />
      </summary>
      <ProfileMenu>
        {session.isCouncil &&
          (mode === 'council' ? (
            <Link to="/">학생 화면으로</Link>
          ) : (
            <Link to="/work">학생회 화면으로</Link>
          ))}
        <button type="button" onClick={() => void onLogout()}>
          로그아웃
        </button>
      </ProfileMenu>
    </Profile>
  );
}

/** 상단 GNB + 본문 + 푸터. 학생·학생회·방문자 화면이 함께 쓴다. */
export function AppLayout({ mode }: { mode: AppMode }) {
  const nav = mode === 'council' ? councilNav : studentNav;
  const loading = useNavigation().state === 'loading';

  return (
    <Shell>
      <SkipLink href="#main">본문으로 건너뛰기</SkipLink>
      <Gnb>
        <GnbInner>
          <Brand
            to={
              mode === 'council'
                ? '/work'
                : mode === 'visitor'
                  ? '/landing'
                  : '/'
            }
          >
            <BrandLogo label="한국디지털미디어고등학교 학생자치회 홈" />
          </Brand>
          <GnbNav aria-label="주요 메뉴">
            {nav.map((item) => (
              <GnbLink key={item.to} to={item.to} end={item.end}>
                {item.label}
              </GnbLink>
            ))}
          </GnbNav>
          <GnbActions $visitor={mode === 'visitor'}>
            {mode === 'visitor' ? (
              <>
                <ButtonLink to="/login">로그인</ButtonLink>
                <ButtonLink theme="accent" variant="primary" to="/signup">
                  회원가입
                </ButtonLink>
              </>
            ) : (
              <>
                {/* 검색·알림은 아직 설계되지 않았다 (기능 명세서 7장). 모양만 Figma대로 둔다. */}
                <GnbIcons>
                  <IconButton
                    icon={iconSearch}
                    label="검색 (준비 중)"
                    theme="badged"
                    title="준비 중"
                  />
                  <IconButton
                    icon={iconNotifications}
                    label="알림 (준비 중)"
                    theme="badged"
                    title="준비 중"
                  />
                </GnbIcons>
                <GnbSeparator aria-hidden="true" />
                <ProfileButton mode={mode} />
              </>
            )}
          </GnbActions>
        </GnbInner>
        {loading && <LoadingBar role="progressbar" aria-label="불러오는 중" />}
      </Gnb>

      <Main id="main" tabIndex={-1} aria-busy={loading}>
        <Outlet />
      </Main>

      <SiteFooter />
    </Shell>
  );
}
