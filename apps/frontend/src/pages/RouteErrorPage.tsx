import { isRouteErrorResponse, useLocation, useRouteError } from 'react-router';
import { PageHeader } from '../app/PageHeader.tsx';
import { ButtonLink } from '../components/ui/index.ts';
import { ApiError, errorMessage } from '../lib/api.ts';

const retryText = '잠시 후 다시 시도해주세요. 계속 안 되면 IT부에 알려주세요.';

/** 라우트 loader가 실패했을 때 셸 안에서 보여주는 화면 */
export function RouteErrorPage() {
  const error = useRouteError();
  const notFound =
    (isRouteErrorResponse(error) && error.status === 404) ||
    (error instanceof ApiError && error.status === 404);
  const forbidden = error instanceof ApiError && error.status === 403;
  const inWork = useLocation().pathname.startsWith('/work');

  let description = retryText;
  if (notFound) {
    description =
      isRouteErrorResponse(error) && typeof error.data === 'string'
        ? error.data
        : '주소가 바뀌었거나 없는 화면입니다.';
  } else if (forbidden) {
    description = errorMessage(error, '이 화면을 볼 권한이 없어요.');
  } else if (error instanceof ApiError || error instanceof TypeError) {
    description = errorMessage(error, retryText);
  }

  return (
    <PageHeader
      title={
        notFound
          ? '찾을 수 없는 화면'
          : forbidden
            ? '볼 수 없는 화면'
            : '화면을 불러오지 못했습니다'
      }
      description={description}
      actions={
        inWork ? (
          <ButtonLink to="/work">업무로 가기</ButtonLink>
        ) : (
          <ButtonLink to="/">홈으로 가기</ButtonLink>
        )
      }
    />
  );
}
