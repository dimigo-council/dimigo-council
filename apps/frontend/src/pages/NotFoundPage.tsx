import { Link } from 'react-router';
import { PageHeader } from '../app/PageHeader.tsx';
import { buttonLook } from '../components/ui/index.ts';

export function NotFoundPage() {
  return (
    <main className="standalone-main">
      <PageHeader
        title="찾을 수 없는 화면"
        description="주소가 바뀌었거나 없는 화면입니다."
        actions={
          <Link
            {...buttonLook({ theme: 'accent', variant: 'primary' })}
            to="/surveys"
          >
            설문으로 가기
          </Link>
        }
      />
    </main>
  );
}
