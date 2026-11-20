import { useState } from 'react';
import { useLoaderData, useRevalidator } from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useSession } from '../../app/session.ts';
import {
  FilterBar,
  FilterSelect,
} from '../../components/intranet/FilterSelect.tsx';
import {
  DataCell,
  EmptyState,
  Owner,
  PersonAvatar,
  SelectControl,
  TableWrap,
} from '../../components/ui/index.ts';
import { listMembers, updatePermission } from './api.ts';
import {
  memberPermissions,
  type Member,
  type MemberPermission,
} from './types.ts';
import * as S from './styles.ts';
import { Input } from '../../dimi-ui-kit/index.ts';
import { iconSearch } from '../../dimi-ui-kit/icons';

export async function memberListLoader() {
  return listMembers();
}

const permissionNote: Record<MemberPermission, string> = {
  관리자: '모든 화면과 공개 검토',
  '부서 관리': '부서의 안건·업무·설문 관리',
  일반: '맡은 업무와 안건 보기',
};

function PermissionCell({
  member,
  editable,
}: {
  member: Member;
  editable: boolean;
}) {
  const revalidator = useRevalidator();
  const [saving, setSaving] = useState(false);

  if (!editable) return <>{member.permission}</>;

  const onChange = async (permission: MemberPermission) => {
    setSaving(true);
    try {
      await updatePermission(member.id, permission);
      await revalidator.revalidate();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SelectControl
      aria-label={`${member.name} 권한`}
      value={member.permission}
      disabled={saving}
      onChange={(event) => {
        const next = memberPermissions.find((p) => p === event.target.value);
        if (next) void onChange(next);
      }}
    >
      {memberPermissions.map((permission) => (
        <option key={permission}>{permission}</option>
      ))}
    </SelectControl>
  );
}

export function MemberListPage() {
  const members = useLoaderData<typeof memberListLoader>();
  const session = useSession();
  const canManage = session.councilRole === '회장단';

  const [department, setDepartment] = useState('');
  const [permission, setPermission] = useState('');
  const [query, setQuery] = useState('');

  const departments = [...new Set(members.map((m) => m.department))];
  const keyword = query.trim();
  const visible = members.filter(
    (m) =>
      (!department || m.department === department) &&
      (!permission || m.permission === permission) &&
      (!keyword || m.name.includes(keyword)),
  );

  return (
    <>
      <PageHeader title="구성원·권한" visuallyHidden />

      <S.MemberBoard>
        <FilterBar>
          <FilterSelect
            label="부서"
            value={department}
            onChange={setDepartment}
          >
            <option value="">전체</option>
            {departments.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="권한"
            value={permission}
            onChange={setPermission}
          >
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
                        {member.name === session.name && (
                          <DataCell as="span" $muted>
                            나
                          </DataCell>
                        )}
                      </Owner>
                    </th>
                    <DataCell $muted>{member.classLabel}</DataCell>
                    <td>{member.department}</td>
                    <td>{member.position}</td>
                    <td>
                      <PermissionCell
                        member={member}
                        editable={canManage && member.name !== session.name}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </S.MemberTable>
          </TableWrap>
        ) : (
          <EmptyState>조건에 맞는 구성원이 없습니다.</EmptyState>
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
    </>
  );
}
