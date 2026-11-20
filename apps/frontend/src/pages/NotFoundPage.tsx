import { PageHeader } from '../app/PageHeader.tsx';
import { StandaloneMain } from '../app/shell.ts';
import { ButtonLink } from '../components/ui/index.ts';

export function NotFoundPage() {
  return (
    <StandaloneMain>
      <PageHeader
        title="찾을 수 없는 화면"
        description="주소가 바뀌었거나 없는 화면입니다."
        actions={
          <ButtonLink theme="accent" variant="primary" to="/surveys">
            설문으로 가기
          </ButtonLink>
        }
      />
    </StandaloneMain>
  );
}
