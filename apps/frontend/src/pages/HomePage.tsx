import { Link } from 'react-router';
import styled, { css } from 'styled-components';
import { useSession } from '../app/session.ts';
import { ButtonLink } from '../components/ui/index.ts';
import { ButtonRoot } from '../dimi-ui-kit/index.ts';

const features = [
  {
    to: '/surveys',
    title: '설문',
    description: '진행 중인 설문을 확인하고 의견을 전할 수 있습니다.',
  },
  {
    to: '/suggestions',
    title: '건의',
    description: '학교생활에 관한 생각을 언제든 제안할 수 있습니다.',
  },
  {
    to: '/activity',
    title: '활동 기록',
    description: '학생회의 안건과 활동 과정을 한곳에서 살펴볼 수 있습니다.',
  },
];

/* 첫 화면: 상단 메뉴 + 서비스 카드 + 푸터 */

const narrow = '@media (max-width: 700px)';

const container = css`
  width: min(100% - 40px, 1080px);
  margin-inline: auto;
`;

const SiteShell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  > main {
    flex: 1;
  }
`;

const SiteHeader = styled.header`
  background: ${({ theme }) => theme.colors.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.core.outline};
`;

const HeaderContent = styled.div`
  ${container}
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  ${narrow} {
    min-height: 64px;
  }
`;

const Brand = styled(Link)`
  ${({ theme: t }) => css`
    color: ${t.colors.core.glyph.primary};
    text-decoration: none;
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    white-space: nowrap;

    strong {
      color: ${t.colors.core.status.accent};
    }
  `}
`;

const HeaderNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;

  ${ButtonRoot} {
    margin-left: 8px;
  }

  ${narrow} {
    ${ButtonRoot} {
      display: none;
    }
  }
`;

const HeaderNavLink = styled(Link)`
  ${({ theme: t }) => css`
    padding: 8px 12px;
    border-radius: ${t.radius.m};
    color: ${t.colors.core.glyph.secondary};
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;

    &:hover {
      color: ${t.colors.core.glyph.primary};
      background: ${t.colors.background.secondary};
    }

    ${narrow} {
      padding: 6px 8px;
      font-size: 0.85rem;
    }
  `}
`;

const Features = styled.section`
  ${container}
  padding-block: 56px 112px;
`;

const SectionHeading = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.core.glyph.primary};
    font-size: 1.5rem;
  }

  ${narrow} {
    display: block;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  ${narrow} {
    grid-template-columns: 1fr;
  }
`;

const FeatureArrow = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
`;

const FeatureCard = styled(Link)`
  ${({ theme: t }) => css`
    display: block;
    padding: 28px;
    color: inherit;
    text-decoration: none;
    transition:
      border-color 0.15s,
      transform 0.15s;
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};

    &:hover {
      border-color: ${t.colors.core.status.accent};
      transform: translateY(-2px);
    }
    &:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: 2px;
    }
    h3 {
      display: flex;
      justify-content: space-between;
      margin: 0 0 12px;
      color: ${t.colors.core.glyph.primary};
      font-size: 1.15rem;
    }
    &:hover ${FeatureArrow} {
      color: ${t.colors.core.status.accent};
    }
    p {
      margin: 0;
      color: ${t.colors.core.glyph.secondary};
      line-height: 1.65;
    }
  `}
`;

const SiteFooter = styled.footer`
  padding: 28px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.core.outline};
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: 0.8rem;
`;

const FooterInner = styled.div`
  ${container}
`;

export function HomePage() {
  const session = useSession();

  return (
    <SiteShell>
      <SiteHeader>
        <HeaderContent>
          <Brand to="/">
            DIMIGO <strong>COUNCIL</strong>
          </Brand>
          <HeaderNav aria-label="주요 메뉴">
            {features.map((feature) => (
              <HeaderNavLink key={feature.to} to={feature.to}>
                {feature.title}
              </HeaderNavLink>
            ))}
            {session.councilRole && (
              <ButtonLink size="small" to="/work/tasks">
                업무공간
              </ButtonLink>
            )}
          </HeaderNav>
        </HeaderContent>
      </SiteHeader>

      <main>
        <Features aria-labelledby="features-title">
          <SectionHeading>
            <h2 id="features-title">함께 만들어갈 공간</h2>
          </SectionHeading>
          <FeatureGrid>
            {features.map((feature) => (
              <FeatureCard key={feature.to} to={feature.to}>
                <h3>
                  {feature.title}
                  <FeatureArrow aria-hidden="true">→</FeatureArrow>
                </h3>
                <p>{feature.description}</p>
              </FeatureCard>
            ))}
          </FeatureGrid>
        </Features>
      </main>

      <SiteFooter>
        <FooterInner>© {new Date().getFullYear()} 디미고 학생회</FooterInner>
      </SiteFooter>
    </SiteShell>
  );
}
