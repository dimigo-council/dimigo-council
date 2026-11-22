import { useState } from 'react';
import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router';
import styled, { css } from 'styled-components';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useBasePath, useIsCouncil } from '../../app/mode.ts';
import { Icon, IconButton, Input } from '../../dimi-ui-kit/index.ts';
import {
  iconArrowForwardIos,
  iconDownload,
  iconSearch,
} from '../../dimi-ui-kit/icons';
import {
  Breadcrumbs,
  Card,
  EmptyState,
  Like,
  ListRowItem,
  ListRowLink,
  ListRowMain,
  ListRowTitle,
} from '../../components/ui/index.ts';
import { formatFullDate, formatShortDate } from '../../lib/date.ts';
import * as A from '../activities/styles.ts';
import { getRecord, listRecords } from './api.ts';
import type { ActivityRecord } from './types.ts';

/* 활동 기록: 사이트 관리자가 배포한 PDF 목록과 PDF 보기. 작성·검토·승인 화면은 없다. */

export async function recordListLoader() {
  return listRecords();
}

export async function recordLoader({ params }: LoaderFunctionArgs) {
  return getRecord(params.recordId ?? '');
}

const Search = styled.div`
  width: min(100%, 320px);
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Aside = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex: none;
    align-items: center;
    gap: ${t.spacing[400]};

    > time {
      ${t.text.footnoteRegular}
      color: ${t.colors.core.glyph.tertiary};
    }
    > svg {
      color: ${t.colors.core.glyph.quaternary};
    }
  `}
`;

/** 목록 한 줄: 제목 · 공감 · 게시일 (Figma ListRow) */
function RecordRow({ record, to }: { record: ActivityRecord; to: string }) {
  // TODO: 공감 API가 생기면 서버 값으로 바꾼다. Figma 목록에 하트가 있어 화면 안에서만 켜고 끈다.
  const [liked, setLiked] = useState(false);
  return (
    <ListRowItem>
      <ListRowMain>
        <ListRowTitle as="h2">
          <ListRowLink as={Link} to={to}>
            {record.title}
          </ListRowLink>
        </ListRowTitle>
      </ListRowMain>
      <Aside>
        <Like
          count={liked ? 1 : 0}
          liked={liked}
          onToggle={() => setLiked(!liked)}
          subject={record.title}
        />
        <time dateTime={record.publishedAt}>
          {formatShortDate(record.publishedAt)}
        </time>
        <Icon icon={iconArrowForwardIos} size={16} />
      </Aside>
    </ListRowItem>
  );
}

export function RecordListPage() {
  const records = useLoaderData<typeof recordListLoader>();
  const council = useIsCouncil();
  const base = useBasePath();
  const [query, setQuery] = useState('');

  const keyword = query.trim();
  const visible = records.filter(
    (record) => !keyword || record.title.includes(keyword),
  );

  return (
    <>
      <PageHeader
        title="활동 기록"
        tall={!council}
        actions={
          council && (
            <Search>
              <Input
                type="search"
                leadingIcon={iconSearch}
                aria-label="활동 기록 찾기"
                placeholder="기록 제목으로 검색"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </Search>
          )
        }
      />
      {visible.length > 0 ? (
        <Card>
          <List aria-label="활동 기록 목록">
            {visible.map((record) => (
              <RecordRow
                key={record.id}
                record={record}
                to={base(`/records/${record.id}`)}
              />
            ))}
          </List>
        </Card>
      ) : (
        <EmptyState>
          {keyword ? '찾는 기록이 없어요.' : '아직 게시된 활동 기록이 없어요.'}
        </EmptyState>
      )}
    </>
  );
}

const ViewerHead = styled.div`
  ${({ theme: t }) => css`
    ${t.text.footnoteWeak}
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: ${t.spacing[550]} 0 ${t.spacing[300]};
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

/** Figma PDF 보기 카드: 안쪽 40 */
const ViewerCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[800]};
`;

const Frame = styled.iframe`
  ${({ theme: t }) => css`
    display: block;
    width: 100%;
    height: min(80vh, 960px);
    border: 0;
    border-radius: ${t.radius.m};
    background: ${t.colors.background.secondary};
  `}
`;

const Published = styled.p`
  ${({ theme: t }) => css`
    ${t.text.footnoteWeak}
    margin: 0 0 ${t.spacing[200]};
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

export function RecordViewerPage() {
  const record = useLoaderData<typeof recordLoader>();
  const base = useBasePath();

  return (
    <>
      <title>{`${record.title} | 디미고 학생회`}</title>
      <Breadcrumbs
        items={[
          { label: '활동 기록', to: base('/records') },
          { label: record.title },
        ]}
      />
      <ViewerCard>
        <Published>
          <time dateTime={record.publishedAt}>
            {formatFullDate(record.publishedAt)}
          </time>{' '}
          게시
        </Published>
        <A.HeadTitle>{record.title}</A.HeadTitle>
        <ViewerHead>
          <span>PDF</span>
          <IconButton
            icon={iconDownload}
            label="PDF 내려받기"
            size="medium"
            theme="outline"
            onClick={() => {
              const link = document.createElement('a');
              link.href = record.file;
              link.download = `${record.title}.pdf`;
              link.click();
            }}
          />
        </ViewerHead>
        <Frame src={record.file} title={`${record.title} PDF`} />
      </ViewerCard>
    </>
  );
}
