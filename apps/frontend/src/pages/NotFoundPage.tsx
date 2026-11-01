import { Link } from 'react-router';
import { PageHeader } from '../app/PageHeader.tsx';

export function NotFoundPage() {
  return (
    <main className="standalone-main">
      <PageHeader
        title="찾을 수 없는 화면"
        description="주소가 바뀌었거나 없는 화면입니다."
        actions={
          <Link className="btn btn--primary" to="/surveys">
            설문으로 가기
          </Link>
        }
      />
    </main>
  );
}
