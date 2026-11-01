import { Notice } from '../components/kit/index.ts';
import { PageHeader } from '../app/PageHeader.tsx';

export interface PlaceholderPageProps {
  title: string;
  description?: string;
  /** 이 화면의 시안 파일 이름 (documents/test_UI) */
  design?: string;
}

/** 아직 구현하지 않은 화면. 라우트와 셸을 먼저 잡기 위한 자리. */
export function PlaceholderPage({
  title,
  description,
  design,
}: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Notice tone="neutral">
        아직 만들지 않은 화면입니다.
        {design && ` 시안: ${design}`}
      </Notice>
    </>
  );
}
