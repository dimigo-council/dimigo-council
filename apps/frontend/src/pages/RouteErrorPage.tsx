import {
  isRouteErrorResponse,
  Link,
  useLocation,
  useRouteError,
} from 'react-router';
import { PageHeader } from '../app/PageHeader.tsx';

/** 라우트 loader가 실패했을 때 셸 안에서 보여주는 화면 */
export function RouteErrorPage() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const inWork = useLocation().pathname.startsWith('/work');

  return (
    <PageHeader
      title={notFound ? '찾을 수 없는 화면' : '화면을 불러오지 못했습니다'}
      description={
        notFound
          ? typeof error.data === 'string'
            ? error.data
            : '주소가 바뀌었거나 없는 화면입니다.'
          : '잠시 후 다시 시도해주세요. 계속 안 되면 IT부에 알려주세요.'
      }
      actions={
        inWork ? (
          <Link className="btn btn--secondary" to="/work">
            업무로 가기
          </Link>
        ) : (
          <Link className="btn btn--secondary" to="/surveys">
            설문으로 가기
          </Link>
        )
      }
    />
  );
}
