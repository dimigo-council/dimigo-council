import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { getSession, useSession } from '../../app/session.ts';
import {
  FilterBar,
  FilterSelect,
} from '../../components/intranet/FilterSelect.tsx';
import {
  DataCell,
  EmptyState,
  Owner,
  PersonAvatar,
  TableWrap,
} from '../../components/ui/index.ts';
import { listCouncilUsers, listDepartments, listMembers } from './api.ts';
import { MemberAdmin } from './MemberAdmin.tsx';
import {
  memberPermissions,
  type Member,
  type MemberPermission,
} from './types.ts';
import * as S from './styles.ts';
import { Input } from '../../dimi-ui-kit/index.ts';
import { iconSearch } from '../../dimi-ui-kit/icons';

export async function memberListLoader() {
  // 관리자는 학생회가 아니어도 들어온다. 관리 화면은 관리자 API만 쓴다.
  if (getSession().isAdmin) {
    const [council, departments] = await Promise.all([
      listCouncilUsers(),
      listDepartments(),
    ]);
    return { admin: true as const, council, departments };
  }
  return { admin: false as const, members: await listMembers() };
}

const permissionNote: Record<MemberPermission, string> = {
  관리자: '모든 화면과 권한 관리',
  '부서 관리': '부서의 활동·업무·설문 관리',
  일반: '맡은 업무와 활동 보기',
};

export function MemberListPage() {
  const data = useLoaderData<typeof memberListLoader>();
  return (
    <>
      <PageHeader title="구성원·권한" visuallyHidden />
      {data.admin ? (
        <MemberAdmin council={data.council} departments={data.departments} />
      ) : (
        <MemberTable members={data.members} />
      )}
    </>
  );
}

/** 학생회 구성원 목록 (보기만) */
function MemberTable({ members }: { members: Member[] }) {
  const session = useSession();

  const [department, setDepartment] = useState('');
  const [permission, setPermission] = useState('');
  const [query, setQuery] = useState('');

  const departments = [
    ...new Set(members.map((m) => m.department).filter(Boolean)),
  ];
  const keyword = query.trim();
  const visible = members.filter(
    (m) =>
      (!department || m.department === department) &&
      (!permission || m.permission === permission) &&
      (!keyword || m.name.includes(keyword)),
  );

  return (
    <S.MemberBoard>
      <FilterBar>
        <FilterSelect label="부서" value={department} onChange={setDepartment}>
          <option value="">전체</option>
          {departments.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </FilterSelect>
        <FilterSelect label="권한" value={permission} onChange={setPermission}>
          <option value="">전체</option>
          {memberPermissions.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </FilterSelect>
        <Input
          type="search"
          leadingIcon={iconSearch}
          aria-label="구성원 찾기"
          placeholder="이름으로 찾기"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </FilterBar>

      {visible.length > 0 ? (
        <TableWrap tabIndex={0} aria-label="구성원 목록">
          <S.MemberTable>
            <thead>
              <tr>
                <th scope="col">이름</th>
                <th scope="col">학반</th>
                <th scope="col">부서</th>
                <th scope="col">직책</th>
                <th scope="col">권한</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((member) => (
                <tr key={member.id}>
                  <th scope="row">
                    <Owner>
                      <PersonAvatar name={member.name} aria-hidden="true" />
                      <strong>{member.name}</strong>
                      {member.id === session.id && (
                        <DataCell as="span" $muted>
                          나
                        </DataCell>
                      )}
                    </Owner>
                  </th>
                  <DataCell $muted>{member.classLabel}</DataCell>
                  <td>{member.department || '부서 없음'}</td>
                  <td>{member.position}</td>
                  <td>{member.permission}</td>
                </tr>
              ))}
            </tbody>
          </S.MemberTable>
        </TableWrap>
      ) : (
        <EmptyState>
          {members.length === 0
            ? '아직 학생회 구성원이 없습니다.'
            : '조건에 맞는 구성원이 없습니다.'}
        </EmptyState>
      )}

      <S.PermissionNotes>
        {memberPermissions.map((item) => (
          <div key={item}>
            <dt>{item}</dt>
            <dd>{permissionNote[item]}</dd>
          </div>
        ))}
      </S.PermissionNotes>
    </S.MemberBoard>
  );
}
