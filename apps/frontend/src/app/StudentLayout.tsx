import { Link, NavLink, Outlet } from 'react-router';
import { BrandMark } from './BrandMark.tsx';
import { useSession } from './session.ts';

const studentNav = [
  { to: '/surveys', label: '설문' },
  { to: '/suggestions', label: '건의' },
  { to: '/activity', label: '학생회 활동' },
];

/** 학생 화면: 상단 GNB + 가운데 본문 + 푸터 */
export function StudentLayout() {
  const session = useSession();

  return (
    <div className="student-shell">
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>
      <header className="gnb">
        <div className="gnb__inner">
          <Link className="shell-brand" to="/">
            <BrandMark />
            디미고 학생회
          </Link>
          <nav className="gnb__nav" aria-label="학생 메뉴">
            {studentNav.map((item) => (
              <NavLink key={item.to} className="gnb__link" to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="gnb__account">
            <span className="gnb__user">
              {session.affiliation} {session.name}
            </span>
            {session.councilRole && (
              <Link className="btn btn--secondary btn--sm" to="/work/tasks">
                업무공간
              </Link>
            )}
          </div>
        </div>
      </header>

      <main id="main" className="student-main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="student-footer">
        <div className="student-footer__inner">
          © {new Date().getFullYear()} 한국디지털미디어고등학교 학생회
        </div>
      </footer>
    </div>
  );
}
