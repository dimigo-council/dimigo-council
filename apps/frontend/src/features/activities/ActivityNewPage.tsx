import { useRef, useState, type FormEvent } from 'react';
import {
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from 'react-router';
import { getSession, useSession } from '../../app/session.ts';
import { Button, TextButton } from '../../dimi-ui-kit/index.ts';
import {
  Breadcrumbs,
  CardTitle,
  FieldFoot,
  FieldHint,
  FieldLabel,
  FieldRoot,
  Notice,
  OptionCard,
  Select,
  SelectControl,
  TextArea,
  TextField,
} from '../../components/ui/index.ts';
import { listCouncilInquiries, setInquiryActivity } from '../inquiries/api.ts';
import { listMembers } from '../members/api.ts';
import { departments, type Department } from '../members/types.ts';
import { createActivity, getActivityDraft, saveActivityDraft } from './api.ts';
import {
  activityScopes,
  type ActivityDraft,
  type ActivityScope,
} from './types.ts';
import * as S from './styles.ts';

/**
 * 활동 등록. ?inquiry=128이면 그 질의를 연결해 시작하고(질의함의 "활동으로 등록"),
 * ?draft면 임시 저장한 내용을 불러온다(활동 목록의 "불러오기").
 */
export async function activityNewLoader({ request }: LoaderFunctionArgs) {
  const params = new URL(request.url).searchParams;
  const [inquiries, members, draft] = await Promise.all([
    listCouncilInquiries(getSession().name),
    listMembers(),
    params.has('draft') ? getActivityDraft() : Promise.resolve(null),
  ]);
  const inquiryId = params.get('inquiry');
  const fromInquiry = inquiries.find((inquiry) => inquiry.id === inquiryId);
  const initial: ActivityDraft = draft ?? {
    title: fromInquiry?.title ?? '',
    inquiryIds: fromInquiry ? [fromInquiry.id] : [],
    firstRecord: fromInquiry
      ? `‘${fromInquiry.title}’ 질의가 공감 ${fromInquiry.likes}개를 받아 활동 후보로 올라왔어요.`
      : '',
    department: fromInquiry?.department,
  };
  return { inquiries, members, initial, restored: draft !== null };
}

const NONE = '';

export function ActivityNewPage() {
  const { inquiries, members, initial, restored } =
    useLoaderData<typeof activityNewLoader>();
  const session = useSession();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const [title, setTitle] = useState(initial.title ?? '');
  const [inquiryIds, setInquiryIds] = useState<string[]>(
    initial.inquiryIds?.length ? initial.inquiryIds : [NONE],
  );
  const [firstRecord, setFirstRecord] = useState(initial.firstRecord ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [department, setDepartment] = useState<Department>(
    initial.department ??
      (session.department as Department | undefined) ??
      '회장단',
  );
  const [owner, setOwner] = useState(initial.owner ?? session.name);
  const [scope, setScope] = useState<ActivityScope>(
    initial.scope ?? '전체 공개',
  );
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle',
  );

  const linked = inquiryIds.filter((id) => id !== NONE);
  const values = {
    title,
    description,
    inquiryIds: linked,
    firstRecord,
    department,
    owner,
    scope,
  };

  const onDraft = async () => {
    await saveActivityDraft(values);
    setStatus('saved');
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'saving') return;
    if (!title.trim()) {
      setError('활동 제목을 적어주세요.');
      formRef.current
        ?.querySelector<HTMLElement>('[data-field="title"]')
        ?.focus();
      return;
    }
    setStatus('saving');
    try {
      const id = await createActivity(values);
      await Promise.all(
        linked.map((inquiryId) =>
          setInquiryActivity(inquiryId, { id, title: title.trim() }),
        ),
      );
      await navigate(`/work/activities/${id}`);
    } catch {
      setStatus('error');
    }
  };

  const setInquiryAt = (index: number, value: string) =>
    setInquiryIds((current) =>
      current.map((item, i) => (i === index ? value : item)),
    );

  return (
    <>
      <title>활동 등록 | 디미고 학생회</title>
      <Breadcrumbs
        items={[
          { label: '활동', to: '/work/activities' },
          { label: '활동 등록' },
        ]}
      />
      <S.PageTitle>활동 등록</S.PageTitle>

      {restored && (
        <S.Restored>
          <Notice tone="info">임시 저장한 내용을 불러왔어요.</Notice>
        </S.Restored>
      )}

      <S.Form ref={formRef} onSubmit={onSubmit} noValidate>
        <S.FormGrid>
          <S.FormCard aria-labelledby="activity-info">
            <CardTitle id="activity-info">활동 정보</CardTitle>
            <TextField
              label="활동 제목"
              data-field="title"
              maxLength={60}
              value={title}
              error={error}
              onChange={(event) => {
                setTitle(event.target.value);
                setError('');
              }}
            />
            <FieldRoot>
              <FieldLabel as="span" id="linked-inquiries">
                연결 질의
              </FieldLabel>
              <S.LinkedInquiries
                role="group"
                aria-labelledby="linked-inquiries"
              >
                {inquiryIds.map((value, index) => (
                  <S.LinkedInquiryRow key={index}>
                    <SelectControl
                      aria-label={`연결 질의 ${index + 1}`}
                      value={value}
                      onChange={(event) =>
                        setInquiryAt(index, event.target.value)
                      }
                    >
                      <option value={NONE}>질의 연결 안함</option>
                      {inquiries
                        .filter(
                          (inquiry) =>
                            inquiry.id === value ||
                            !inquiryIds.includes(inquiry.id),
                        )
                        .map((inquiry) => (
                          <option key={inquiry.id} value={inquiry.id}>
                            질의 #{inquiry.id} · {inquiry.title}
                          </option>
                        ))}
                    </SelectControl>
                    {inquiryIds.length > 1 && (
                      <TextButton
                        size="small"
                        onClick={() =>
                          setInquiryIds((current) =>
                            current.filter((_, i) => i !== index),
                          )
                        }
                      >
                        빼기
                      </TextButton>
                    )}
                  </S.LinkedInquiryRow>
                ))}
                <div>
                  <TextButton
                    size="small"
                    onClick={() =>
                      setInquiryIds((current) => [...current, NONE])
                    }
                  >
                    + 질의 더 연결하기
                  </TextButton>
                </div>
              </S.LinkedInquiries>
              <FieldFoot>
                <FieldHint>
                  질의를 연결하면 활동 상세에 질의 기록이 자동으로 남아요.
                </FieldHint>
              </FieldFoot>
            </FieldRoot>
            <TextField
              label="첫 추진 기록"
              maxLength={100}
              hint="활동 상세 진행 기록의 첫 항목으로 남아요."
              value={firstRecord}
              onChange={(event) => setFirstRecord(event.target.value)}
            />
            <TextArea
              label="활동 설명"
              rows={4}
              maxLength={500}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </S.FormCard>

          <S.FormCard aria-labelledby="activity-manage">
            <CardTitle id="activity-manage">관리 설정</CardTitle>
            <Select
              label="담당 부서"
              value={department}
              onChange={(event) => {
                const next = departments.find(
                  (item) => item === event.target.value,
                );
                if (next) setDepartment(next);
              }}
            >
              {departments.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
            <Select
              label="담당자"
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
            >
              {members.map((member) => (
                <option key={member.id} value={member.name}>
                  {member.name} ({member.department})
                </option>
              ))}
            </Select>
            <FieldRoot>
              <FieldLabel as="span" id="activity-scope">
                공개 범위
              </FieldLabel>
              <S.ScopeOptions
                role="radiogroup"
                aria-labelledby="activity-scope"
              >
                {activityScopes.map((item) => (
                  <OptionCard
                    key={item}
                    name="new-activity-scope"
                    title={item}
                    checked={scope === item}
                    onChange={() => setScope(item)}
                  />
                ))}
              </S.ScopeOptions>
              <FieldFoot>
                <FieldHint>
                  전체 공개는 모든 학생이, 학생회는 학생회 임원만 볼 수 있어요.
                </FieldHint>
              </FieldFoot>
            </FieldRoot>
          </S.FormCard>
        </S.FormGrid>

        {status === 'error' && (
          <Notice tone="warn" role="alert">
            등록하지 못했습니다. 잠시 후 다시 시도해주세요.
          </Notice>
        )}

        <S.FormButtons>
          <Button onClick={() => void onDraft()}>임시 저장</Button>
          <Button
            type="submit"
            theme="accent"
            variant="primary"
            disabled={status === 'saving'}
          >
            활동 등록
          </Button>
          <S.ShareStatus role="status">
            {status === 'saved' &&
              '임시 저장했어요. 활동 목록의 불러오기로 이어서 쓸 수 있어요.'}
          </S.ShareStatus>
        </S.FormButtons>
      </S.Form>
    </>
  );
}
