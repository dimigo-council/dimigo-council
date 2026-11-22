import styled, { css } from 'styled-components';
import { privacy, terms, type PolicyDocument } from './policyContent.ts';

/* Figma 공통 / 약관: 가운데 800 문서, 안쪽 40, 조 사이 32, 조 제목과 문단 12, 문단 사이 8 */
const Document = styled.article`
  ${({ theme: t }) => css`
    display: flex;
    flex-direction: column;
    gap: ${t.spacing[700]};
    align-self: center;
    box-sizing: border-box;
    width: min(100%, 800px);
    padding: ${t.spacing[800]};
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};

    h1 {
      ${t.text.titleStrong}
      margin: 0;
      color: ${t.colors.core.glyph.primary};
    }
    @media (max-width: 600px) {
      padding: ${t.spacing[550]};
    }
  `}
`;

const Article = styled.section`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[300]};

    h2 {
      ${t.text.headlineStrong}
      margin: 0;
      color: ${t.colors.core.glyph.primary};
    }
    > div {
      display: grid;
      gap: ${t.spacing[200]};
      ${t.text.bodyRegular}
      color: ${t.colors.core.glyph.secondary};
    }
    p {
      margin: 0;
      white-space: pre-line;
    }
    ol {
      margin: 0;
      padding-left: ${t.spacing[550]};
    }
  `}
`;

function Policy({ document }: { document: PolicyDocument }) {
  return (
    <Document aria-labelledby="policy-title">
      <title>{`${document.title} | 디미고 학생회`}</title>
      <h1 id="policy-title">{document.title}</h1>
      {document.articles.map((article) => (
        <Article key={article.title} aria-label={article.title}>
          <h2>{article.title}</h2>
          <div>
            {article.items.map((item, index) =>
              Array.isArray(item) ? (
                <ol key={index}>
                  {item.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ol>
              ) : (
                <p key={index}>{item}</p>
              ),
            )}
          </div>
        </Article>
      ))}
    </Document>
  );
}

/** 공통 / 이용약관 */
export function TermsPage() {
  return <Policy document={terms} />;
}

/** 공통 / 개인정보처리방침 */
export function PrivacyPage() {
  return <Policy document={privacy} />;
}
