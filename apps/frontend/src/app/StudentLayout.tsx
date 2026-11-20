import { NavLink, Outlet } from 'react-router';
import styled, { css } from 'styled-components';
import { BrandMark } from './BrandMark.tsx';
import { useSession } from './session.ts';
import { koreanWrap, ShellBrand, SkipLink } from './shell.ts';
import { ButtonLink } from '../components/ui/index.ts';

const narrow = '@media (max-width: 720px)';

const column = css`
  width: min(100% - 32px, 992px);
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
  background: ${({ theme }) => theme.colors.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.core.outline};
`;

const GnbInner = styled.div`
  ${column}
  display: flex;
  align-items: center;
  gap: 28px;
  min-height: 60px;

  ${narrow} {
    flex-wrap: wrap;
    gap: 0 16px;
    padding-top: 8px;
  }
`;

const GnbNav = styled.nav`
  display: flex;
  align-self: stretch;
  gap: 4px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  ${narrow} {
    order: 2;
    flex-basis: 100%;
    min-height: 44px;
    margin-inline: -12px;
  }
`;

const GnbLink = styled(NavLink)`
  ${({ theme: t }) => css`
    display: inline-flex;
    flex: none;
    align-items: center;
    padding: 0 12px;
    border-bottom: 2px solid transparent;
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    text-decoration: none;
    white-space: nowrap;

    &:hover {
      color: ${t.colors.core.glyph.primary};
    }
    &[aria-current='page'] {
      border-bottom-color: ${t.colors.core.glyph.primary};
      color: ${t.colors.core.glyph.primary};
      font-weight: 700;
    }
    &:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: -2px;
    }
  `}
`;

const GnbAccount = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;

  ${narrow} {
    order: 1;
  }
`;

const GnbUser = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.secondary};
  font-size: ${({ theme }) => theme.font.size.callout};
  white-space: nowrap;

  ${narrow} {
    display: none;
  }
`;

const Main = styled.main`
  ${column}
  flex: 1;
  padding-block: 40px 80px;

  ${narrow} {
    padding-block: 28px 56px;
  }
`;

const Footer = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.core.outline};
  background: ${({ theme }) => theme.colors.background.primary};
`;

const FooterInner = styled.div`
  ${column}
  padding-block: 20px;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

const studentNav = [
  { to: '/surveys', label: '설문' },
  { to: '/suggestions', label: '건의' },
  { to: '/activity', label: '학생회 활동' },
];

/** 학생 화면: 상단 GNB + 가운데 본문 + 푸터 */
export function StudentLayout() {
  const session = useSession();

  return (
    <Shell>
      <SkipLink href="#main">본문으로 건너뛰기</SkipLink>
      <Gnb>
        <GnbInner>
          <ShellBrand to="/">
            <BrandMark />
            디미고 학생회
          </ShellBrand>
          <GnbNav aria-label="학생 메뉴">
            {studentNav.map((item) => (
              <GnbLink key={item.to} to={item.to}>
                {item.label}
              </GnbLink>
            ))}
          </GnbNav>
          <GnbAccount>
            <GnbUser>
              {session.affiliation} {session.name}
            </GnbUser>
            {session.councilRole && (
              <ButtonLink size="small" to="/work/tasks">
                업무공간
              </ButtonLink>
            )}
          </GnbAccount>
        </GnbInner>
      </Gnb>

      <Main id="main" tabIndex={-1}>
        <Outlet />
      </Main>

      <Footer>
        <FooterInner>
          © {new Date().getFullYear()} 한국디지털미디어고등학교 학생회
        </FooterInner>
      </Footer>
    </Shell>
  );
}
