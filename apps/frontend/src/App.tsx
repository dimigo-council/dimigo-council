const features = [
  {
    title: '설문',
    description: '진행 중인 설문을 확인하고 의견을 전할 수 있습니다.',
  },
  {
    title: '건의',
    description: '학교생활에 관한 생각을 언제든 제안할 수 있습니다.',
  },
  {
    title: '활동 기록',
    description: '학생회의 안건과 활동 과정을 한곳에서 살펴볼 수 있습니다.',
  },
];

function App() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container header-content">
          <span className="brand">
            DIMIGO <strong>COUNCIL</strong>
          </span>
          <span className="header-label">한국디지털미디어고등학교 학생회</span>
        </div>
      </header>

      <main>
        <section className="hero container" aria-labelledby="hero-title">
          <p className="eyebrow">학생회 인트라넷</p>
          <h1 id="hero-title">
            우리의 의견이
            <br />
            학교의 변화로
          </h1>
          <p className="hero-description">
            설문과 건의, 학생회의 활동을 한곳에서 이어갑니다.
          </p>
        </section>

        <section
          className="features container"
          aria-labelledby="features-title"
        >
          <div className="section-heading">
            <h2 id="features-title">함께 만들어갈 공간</h2>
            <p>서비스를 준비하고 있습니다.</p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
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

export default App;
