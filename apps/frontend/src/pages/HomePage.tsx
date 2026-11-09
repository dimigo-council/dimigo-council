import { Link } from 'react-router';
import { useSession } from '../app/session.ts';
import './HomePage.css';

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

export function HomePage() {
  const session = useSession();

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container header-content">
          <Link className="brand" to="/">
            DIMIGO <strong>COUNCIL</strong>
          </Link>
          <nav className="header-nav" aria-label="주요 메뉴">
            {features.map((feature) => (
              <Link
                key={feature.to}
                className="header-nav__link"
                to={feature.to}
              >
                {feature.title}
              </Link>
            ))}
            {session.councilRole && (
              <Link className="btn btn--secondary btn--sm" to="/work/tasks">
                업무공간
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section
          className="features container"
          aria-labelledby="features-title"
        >
          <div className="section-heading">
            <h2 id="features-title">함께 만들어갈 공간</h2>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <Link className="feature-card" key={feature.to} to={feature.to}>
                <h3>
                  {feature.title}
                  <span className="feature-card__arrow" aria-hidden="true">
                    →
                  </span>
                </h3>
                <p>{feature.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          © {new Date().getFullYear()} 디미고 학생회
        </div>
      </footer>
    </div>
  );
}
