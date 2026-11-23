import { useEffect, useState, type FormEvent } from 'react';
import {
  Link,
  useLocation,
  useRevalidator,
  useSearchParams,
} from 'react-router';
import { useSession } from '../../app/session.ts';
import { Badge, Button, Input, TextButton } from '../../dimi-ui-kit/index.ts';
import { iconSearch } from '../../dimi-ui-kit/icons';
import {
  CardTitle,
  EmptyState,
  FilterChips,
  ListRowAside,
  ListRowLink,
  ListRowMain,
  ListRowMeta,
  ListRowTitle,
  ListRowActions,
  Notice,
  PersonAvatar,
  Select,
  Tabs,
  TextField,
  TwoColumn,
} from '../../components/ui/index.ts';
import { errorMessage } from '../../lib/api.ts';
import {
  assignDepartment,
  createDepartment,
  deleteDepartment,
  removeFromDepartment,
  renameDepartment,
  searchUsers,
  setCouncil,
} from './api.ts';
import type { DepartmentRef, DepartmentRole, ManagedUser } from './types.ts';
import * as S from './styles.ts';

type View = 'people' | 'departments';
type Scope = 'council' | 'all';

/** 화면에 보이는 권한: 학생회가 아니면 '학생회 아님' */
function permissionOf(user: ManagedUser) {
  if (user.isAdmin) return '관리자';
  if (!user.isStudentCouncil) return '학생회 아님';
  return user.permission;
}

/** 어떤 일을 하는 동안 버튼을 막고, 실패하면 문구를 보여준다. */
function useAction(fallback: string) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
      return true;
    } catch (caught) {
      setError(errorMessage(caught, fallback));
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, setError, run };
}

function ErrorNotice({ error }: { error: string }) {
  if (!error) return null;
  return (
    <Notice tone="warn" role="alert">
      {error}
    </Notice>
  );
}

/** 관리자(isAdmin) 화면: 구성원의 학생회 권한과 부서, 부서 목록을 관리한다. */
export function MemberAdmin({
  council,
  departments,
}: {
  council: ManagedUser[];
  departments: DepartmentRef[];
}) {
  const [params, setParams] = useSearchParams();
  const view: View =
    params.get('view') === 'departments' ? 'departments' : 'people';

  return (
    <S.AdminBoard>
      <Tabs<View>
        aria-label="관리할 항목"
        idPrefix="members"
        value={view}
        onChange={(next) =>
          setParams(next === 'people' ? {} : { view: next }, { replace: true })
        }
        items={[
          { value: 'people', label: '구성원', count: council.length },
          {
            value: 'departments',
            label: '부서',
            count: departments.length,
          },
        ]}
      />
      <div
        role="tabpanel"
        id={`members-panel-${view}`}
        aria-labelledby={`members-tab-${view}`}
      >
        {view === 'people' ? (
          <PeopleView council={council} departments={departments} />
        ) : (
          <DepartmentsView council={council} departments={departments} />
        )}
      </div>
    </S.AdminBoard>
  );
}

/* ---------- 구성원: 학생회 목록 · 사용자 찾기 + 오른쪽 관리 패널 ---------- */

function PeopleView({
  council,
  departments,
}: {
  council: ManagedUser[];
  departments: DepartmentRef[];
}) {
  const session = useSession();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const scope: Scope = params.get('scope') === 'all' ? 'all' : 'council';
  const [query, setQuery] = useState('');
  const keyword = query.trim();

  // 전체 사용자는 서버에서 찾는다 (이름·이메일). 바꾼 뒤에는 version을 올려 다시 받는다.
  const [version, setVersion] = useState(0);
  const [found, setFound] = useState<{
    users: ManagedUser[];
    total: number;
  } | null>(null);
  const [searchError, setSearchError] = useState('');
  useEffect(() => {
    if (scope !== 'all') return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchUsers(keyword, controller.signal)
        .then((result) => {
          setFound(result);
          setSearchError('');
        })
        .catch((caught: unknown) => {
          if (controller.signal.aborted) return;
          setSearchError(errorMessage(caught, '사용자를 불러오지 못했어요.'));
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [scope, keyword, version]);

  const lower = keyword.toLowerCase();
  const visible =
    scope === 'council'
      ? council.filter(
          (user) =>
            !lower ||
            user.name.toLowerCase().includes(lower) ||
            user.email.toLowerCase().includes(lower),
        )
      : (found?.users ?? []);

  // 방금 바꾼 사람은 목록에서 빠져도 (학생회에서 뺀 경우) 패널에 남긴다.
  const [pinned, setPinned] = useState<ManagedUser | null>(null);
  const selectedId = params.get('id');
  const selected =
    (selectedId &&
      (council.find((user) => user.id === selectedId) ??
        found?.users.find((user) => user.id === selectedId) ??
        (pinned?.id === selectedId ? pinned : undefined))) ||
    visible[0];

  const linkFor = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('id', id);
    return `${pathname}?${next.toString()}`;
  };

  const setScope = (next: Scope) =>
    setParams(
      (current) => {
        const updated = new URLSearchParams(current);
        if (next === 'council') updated.delete('scope');
        else updated.set('scope', next);
        return updated;
      },
      { replace: true },
    );

  const onChanged = (user: ManagedUser) => {
    setPinned(user);
    setVersion((value) => value + 1);
    setParams(
      (current) => {
        const updated = new URLSearchParams(current);
        updated.set('id', user.id);
        return updated;
      },
      { replace: true },
    );
  };

  const loading = scope === 'all' && !found && !searchError;

  return (
    <TwoColumn $aside="480px">
      <S.ListCard aria-labelledby="people-title">
        <S.ListHead>
          <CardTitle id="people-title">구성원</CardTitle>
          <FilterChips<Scope>
            aria-label="보기"
            value={scope}
            onChange={setScope}
            items={[
              { value: 'council', label: '학생회' },
              { value: 'all', label: '전체 사용자' },
            ]}
          />
        </S.ListHead>
        <Input
          type="search"
          leadingIcon={iconSearch}
          aria-label="사용자 찾기"
          placeholder="이름이나 이메일로 찾기"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ErrorNotice error={searchError} />
        {visible.length > 0 ? (
          <S.List aria-label="구성원 목록">
            {visible.map((user) => (
              <S.PersonRow
                key={user.id}
                aria-current={selected?.id === user.id ? 'true' : undefined}
              >
                <PersonAvatar name={user.name} aria-hidden="true" />
                <ListRowMain>
                  <ListRowTitle>
                    <ListRowLink as={Link} to={linkFor(user.id)} replace>
                      {user.name}
                    </ListRowLink>
                  </ListRowTitle>
                  <ListRowMeta>
                    {user.classLabel && <span>{user.classLabel}</span>}
                    <span>{user.email}</span>
                  </ListRowMeta>
                </ListRowMain>
                <ListRowAside>
                  <S.RowBadges>
                    {user.id === session.id && <Badge size="small">나</Badge>}
                    {user.isAdmin && <Badge size="small">관리자</Badge>}
                    {scope === 'all' && user.isStudentCouncil && (
                      <Badge size="small" theme="solid">
                        학생회
                      </Badge>
                    )}
                  </S.RowBadges>
                  {user.department &&
                    `${user.department.name} · ${user.position}`}
                </ListRowAside>
              </S.PersonRow>
            ))}
          </S.List>
        ) : (
          !loading && (
            <EmptyState>
              {keyword
                ? '찾는 사람이 없어요.'
                : scope === 'council'
                  ? '아직 학생회 구성원이 없어요. 전체 사용자에서 찾아 추가해 주세요.'
                  : '가입한 사용자가 없어요.'}
            </EmptyState>
          )
        )}
        {scope === 'all' && found && found.total > found.users.length && (
          <S.ListFoot>
            {found.total}명 가운데 {found.users.length}명만 보여요. 이름이나
            이메일을 더 자세히 적어 주세요.
          </S.ListFoot>
        )}
      </S.ListCard>

      {selected && (
        <MemberPanel
          // 학생회·부서가 바뀌면 입력칸을 서버 값으로 다시 채운다.
          key={[
            selected.id,
            selected.isStudentCouncil,
            selected.department?.id,
            selected.role,
            selected.customPosition,
          ].join(':')}
          user={selected}
          departments={departments}
          onChanged={onChanged}
        />
      )}
    </TwoColumn>
  );
}

/** 오른쪽 패널: 학생회 권한, 부서 배정 */
function MemberPanel({
  user,
  departments,
  onChanged,
}: {
  user: ManagedUser;
  departments: DepartmentRef[];
  onChanged: (user: ManagedUser) => void;
}) {
  const revalidator = useRevalidator();
  const council = useAction('학생회 권한을 바꾸지 못했어요.');
  const membership = useAction('부서를 바꾸지 못했어요.');
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [departmentId, setDepartmentId] = useState(
    user.department ? String(user.department.id) : '',
  );
  const [role, setRole] = useState<DepartmentRole>(user.role ?? 'member');
  const [position, setPosition] = useState(user.customPosition ?? '');

  const apply = async (change: () => Promise<ManagedUser>) => {
    const updated = await change();
    await revalidator.revalidate();
    onChanged(updated);
  };

  const onGrant = () =>
    void council.run(() => apply(() => setCouncil(user.id, true)));
  const onRevoke = () =>
    void council.run(() => apply(() => setCouncil(user.id, false)));

  const onSave = (event: FormEvent) => {
    event.preventDefault();
    if (!departmentId) {
      membership.setError('부서를 골라 주세요.');
      return;
    }
    void membership.run(() =>
      apply(() =>
        assignDepartment(user.id, {
          departmentId: Number(departmentId),
          role,
          position: position.trim() || null,
        }),
      ),
    );
  };

  const onRemove = () =>
    void membership.run(() => apply(() => removeFromDepartment(user.id)));

  const unchanged =
    departmentId === String(user.department?.id ?? '') &&
    role === (user.role ?? 'member') &&
    position.trim() === (user.customPosition ?? '');

  return (
    <S.SideCard aria-labelledby="member-title">
      <S.PanelTitle id="member-title">{user.name}</S.PanelTitle>
      <S.Facts>
        <dt>이메일</dt>
        <dd>{user.email}</dd>
        {user.classLabel && (
          <>
            <dt>학반</dt>
            <dd>{user.classLabel}</dd>
          </>
        )}
        <dt>권한</dt>
        <dd>{permissionOf(user)}</dd>
        {user.department && (
          <>
            <dt>부서</dt>
            <dd>
              {user.department.name} · {user.position}
            </dd>
          </>
        )}
      </S.Facts>

      <S.Section aria-labelledby="council-title">
        <S.SectionTitle id="council-title">학생회</S.SectionTitle>
        {user.isStudentCouncil ? (
          confirmRevoke ? (
            <Notice tone="warn" role="alert">
              {user.name}님을 학생회에서 빼면{' '}
              {user.department
                ? `${user.department.name} 소속도 함께 지워져요.`
                : '학생회 화면에 들어갈 수 없게 돼요.'}
              <S.ConfirmActions>
                <Button size="small" onClick={() => setConfirmRevoke(false)}>
                  취소
                </Button>
                <Button
                  size="small"
                  theme="negative"
                  variant="primary"
                  disabled={council.busy}
                  onClick={onRevoke}
                >
                  학생회에서 빼기
                </Button>
              </S.ConfirmActions>
            </Notice>
          ) : (
            <S.Actions>
              <S.SectionText>학생회 화면을 쓸 수 있어요.</S.SectionText>
              <TextButton
                theme="negative"
                disabled={council.busy}
                onClick={() => setConfirmRevoke(true)}
              >
                학생회에서 빼기
              </TextButton>
            </S.Actions>
          )
        ) : (
          <S.Actions>
            <S.SectionText>학생회 화면을 쓸 수 없어요.</S.SectionText>
            <Button
              theme="accent"
              variant="primary"
              disabled={council.busy}
              onClick={onGrant}
            >
              학생회에 추가
            </Button>
          </S.Actions>
        )}
        <ErrorNotice error={council.error} />
        <Notice tone="neutral">
          학생회 권한은 15분 안에 그 사람 화면에 반영돼요.
          {user.isAdmin && ' 관리자 권한은 여기서 바꿀 수 없어요.'}
        </Notice>
      </S.Section>

      {user.isStudentCouncil && (
        <S.Section aria-labelledby="department-title">
          <S.SectionTitle id="department-title">부서 배정</S.SectionTitle>
          {departments.length === 0 ? (
            <S.SectionText>
              먼저 부서 탭에서 부서를 만들어 주세요.
            </S.SectionText>
          ) : (
            <form onSubmit={onSave}>
              <S.AdminBoard as="div">
                <Select
                  label="부서"
                  value={departmentId}
                  onChange={(event) => setDepartmentId(event.target.value)}
                >
                  <option value="">부서를 골라 주세요</option>
                  {departments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label="부서 권한"
                  hint="부서 관리는 부서의 활동·업무·설문을 관리해요."
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value === 'head' ? 'head' : 'member')
                  }
                >
                  <option value="member">일반</option>
                  <option value="head">부서 관리</option>
                </Select>
                <TextField
                  label="직책"
                  optional
                  maxLength={40}
                  placeholder={role === 'head' ? '부장' : '부원'}
                  hint="비워 두면 부서 권한에 따라 부장·부원으로 보여요."
                  value={position}
                  onChange={(event) => setPosition(event.target.value)}
                />
                <ErrorNotice error={membership.error} />
                <S.Actions>
                  {user.department ? (
                    <TextButton
                      theme="negative"
                      disabled={membership.busy}
                      onClick={onRemove}
                    >
                      부서에서 빼기
                    </TextButton>
                  ) : (
                    <span />
                  )}
                  <Button
                    type="submit"
                    theme="accent"
                    variant="primary"
                    disabled={membership.busy || unchanged}
                  >
                    {user.department ? '저장' : '배정'}
                  </Button>
                </S.Actions>
              </S.AdminBoard>
            </form>
          )}
        </S.Section>
      )}
    </S.SideCard>
  );
}

/* ---------- 부서: 목록 + 부서 만들기 ---------- */

function DepartmentsView({
  council,
  departments,
}: {
  council: ManagedUser[];
  departments: DepartmentRef[];
}) {
  const revalidator = useRevalidator();
  const create = useAction('부서를 만들지 못했어요.');
  const [name, setName] = useState('');

  const onCreate = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    void create
      .run(async () => {
        await createDepartment(trimmed);
        await revalidator.revalidate();
      })
      .then((ok) => {
        if (ok) setName('');
      });
  };

  return (
    <TwoColumn>
      <S.ListCard aria-labelledby="departments-title">
        <S.ListHead>
          <CardTitle id="departments-title">부서</CardTitle>
        </S.ListHead>
        {departments.length > 0 ? (
          <S.List aria-label="부서 목록">
            {departments.map((department) => (
              <DepartmentItem
                key={department.id}
                department={department}
                members={council.filter(
                  (user) => user.department?.id === department.id,
                )}
              />
            ))}
          </S.List>
        ) : (
          <EmptyState>아직 부서가 없어요.</EmptyState>
        )}
      </S.ListCard>

      <S.SideCard aria-labelledby="new-department-title">
        <S.PanelTitle id="new-department-title">부서 만들기</S.PanelTitle>
        <form onSubmit={onCreate}>
          <S.AdminBoard as="div">
            <TextField
              label="부서 이름"
              maxLength={40}
              placeholder="예: 홍보부"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                create.setError('');
              }}
            />
            <ErrorNotice error={create.error} />
            <S.Actions>
              <Button
                type="submit"
                theme="accent"
                variant="primary"
                disabled={create.busy || !name.trim()}
              >
                만들기
              </Button>
            </S.Actions>
          </S.AdminBoard>
        </form>
      </S.SideCard>
    </TwoColumn>
  );
}

function DepartmentItem({
  department,
  members,
}: {
  department: DepartmentRef;
  members: ManagedUser[];
}) {
  const revalidator = useRevalidator();
  const action = useAction('부서를 바꾸지 못했어요.');
  const [mode, setMode] = useState<'view' | 'rename' | 'delete'>('view');
  const [name, setName] = useState(department.name);
  const heads = members.filter((user) => user.role === 'head');

  const onRename = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === department.name) {
      setMode('view');
      return;
    }
    void action
      .run(async () => {
        await renameDepartment(department.id, trimmed);
        await revalidator.revalidate();
      })
      .then((ok) => {
        if (ok) setMode('view');
      });
  };

  const onDelete = () =>
    void action.run(async () => {
      await deleteDepartment(department.id);
      await revalidator.revalidate();
    });

  if (mode === 'rename') {
    return (
      <S.DepartmentRow>
        <S.InlineForm onSubmit={onRename}>
          <Input
            aria-label={`${department.name} 새 이름`}
            maxLength={40}
            value={name}
            autoFocus
            onChange={(event) => setName(event.target.value)}
          />
          <Button
            size="small"
            onClick={() => {
              setName(department.name);
              setMode('view');
              action.setError('');
            }}
          >
            취소
          </Button>
          <Button
            size="small"
            type="submit"
            theme="accent"
            variant="primary"
            disabled={action.busy || !name.trim()}
          >
            저장
          </Button>
        </S.InlineForm>
        <ErrorNotice error={action.error} />
      </S.DepartmentRow>
    );
  }

  return (
    <S.DepartmentRow>
      <ListRowMain>
        <ListRowTitle>{department.name}</ListRowTitle>
        <ListRowMeta>
          <span>구성원 {members.length}명</span>
          {heads.length > 0 && (
            <span>부서 관리 {heads.map((user) => user.name).join(', ')}</span>
          )}
        </ListRowMeta>
      </ListRowMain>
      {mode === 'view' && (
        <ListRowActions>
          <TextButton size="small" onClick={() => setMode('rename')}>
            이름 바꾸기
          </TextButton>
          <TextButton
            size="small"
            theme="negative"
            onClick={() => setMode('delete')}
          >
            삭제
          </TextButton>
        </ListRowActions>
      )}
      {mode === 'delete' && (
        <Notice tone="warn" role="alert">
          ‘{department.name}’ 부서를 삭제할까요?{' '}
          {members.length > 0 &&
            `구성원 ${members.length}명의 부서 배정이 풀리고, `}
          이 부서에 연결된 활동·업무·설문·질의는 담당 부서가 비게 돼요. 되돌릴
          수 없어요.
          <S.ConfirmActions>
            <Button size="small" onClick={() => setMode('view')}>
              취소
            </Button>
            <Button
              size="small"
              theme="negative"
              variant="primary"
              disabled={action.busy}
              onClick={onDelete}
            >
              삭제
            </Button>
          </S.ConfirmActions>
        </Notice>
      )}
      <ErrorNotice error={action.error} />
    </S.DepartmentRow>
  );
}
