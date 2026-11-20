import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from 'react-router';
import { ChevronLeftIcon, PhotoIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { Badge, Button, TextButton } from '../../dimi-ui-kit/index.ts';
import {
  Checkbox,
  ChoiceGroup,
  Notice,
  statusTone,
  TextArea,
  TextField,
  BackLink,
  ButtonLink,
  SplitLayout,
  SplitAside,
  FieldRoot,
  FieldLabel,
  FieldOptional,
  FieldFoot,
  FieldError,
  FormActions,
  Panel,
  PanelTitle,
  PanelNote,
  VisuallyHidden,
} from '../../components/ui/index.ts';
import { findSimilarAgendas, getPublicAgenda } from '../activity/api.ts';
import type { PublicAgenda } from '../activity/types.ts';
import { createSuggestion } from './api.ts';
import {
  suggestionCategories,
  type AgendaRef,
  type SuggestionCategory,
} from './types.ts';
import * as S from './styles.ts';

/** 공개 안건의 "이 안건에 의견 보태기"로 오면 ?agenda=안건번호가 붙는다. */
export async function newSuggestionLoader({
  request,
}: LoaderFunctionArgs): Promise<AgendaRef | null> {
  const agendaId = new URL(request.url).searchParams.get('agenda');
  if (!agendaId) return null;
  try {
    const agenda = await getPublicAgenda(agendaId);
    return { id: agenda.id, title: agenda.title };
  } catch {
    return null;
  }
}

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const TITLE_MAX = 60;
const BODY_MAX = 2000;

type FieldName = 'category' | 'title' | 'body' | 'photos';

function useSimilarAgendas(title: string) {
  const [similar, setSimilar] = useState<PublicAgenda[]>([]);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      void findSimilarAgendas(title).then((found) => {
        if (active) setSimilar(found);
      });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [title]);
  return similar;
}

export function NewSuggestionPage() {
  const aboutAgenda = useLoaderData<typeof newSuggestionLoader>();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [category, setCategory] = useState<SuggestionCategory | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const similar = useSimilarAgendas(title);

  const clearError = (field: FieldName) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const onPickPhotos = (files: FileList | null) => {
    if (!files) return;
    const picked = [...photos, ...Array.from(files)];
    const tooBig = picked.filter((file) => file.size > MAX_PHOTO_BYTES);
    const kept = picked
      .filter((file) => file.size <= MAX_PHOTO_BYTES)
      .slice(0, MAX_PHOTOS);
    setPhotos(kept);
    setErrors((prev) => ({
      ...prev,
      photos:
        tooBig.length > 0
          ? `10MB가 넘는 사진 ${tooBig.length}장은 빼고 올렸습니다.`
          : picked.length > MAX_PHOTOS
            ? `사진은 ${MAX_PHOTOS}장까지 올릴 수 있습니다.`
            : undefined,
    }));
  };

  const validate = () => {
    const next: Partial<Record<FieldName, string>> = {};
    if (!category) next.category = '분류를 골라주세요.';
    if (!title.trim()) next.title = '제목을 적어주세요.';
    if (!body.trim()) next.body = '내용을 적어주세요.';
    setErrors(next);
    return next;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'saving') return;
    const found = validate();
    const first = (['category', 'title', 'body'] as const).find(
      (field) => found[field],
    );
    if (first) {
      const selector =
        first === 'category'
          ? 'input[name="category"]'
          : `[data-field="${first}"]`;
      formRef.current?.querySelector<HTMLElement>(selector)?.focus();
      return;
    }
    setStatus('saving');
    try {
      const id = await createSuggestion({
        category: category!,
        title,
        body,
        identity: isAnonymous ? 'anonymous' : 'named',
        photos: photos.map((file) => file.name),
        ...(aboutAgenda && { aboutAgenda }),
      });
      await navigate(`/suggestions/${id}`, { replace: true });
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <BackLink to="/suggestions">
        <ChevronLeftIcon />내 건의
      </BackLink>
      <PageHeader title="새 건의" />

      <SplitLayout>
        <S.SuggestionForm
          as="form"
          ref={formRef}
          onSubmit={onSubmit}
          noValidate
        >
          {aboutAgenda && (
            <Notice tone="info">
              <strong>{aboutAgenda.title}</strong> 안건에 보태는 의견으로
              보냅니다.
            </Notice>
          )}

          <FieldRoot>
            <FieldLabel as="span" id="category-label">
              분류
            </FieldLabel>
            <ChoiceGroup
              variant="chips"
              name="category"
              aria-labelledby="category-label"
              aria-describedby={errors.category ? 'category-error' : undefined}
              aria-invalid={errors.category ? true : undefined}
              value={category}
              onChange={(next) => {
                setCategory(next);
                clearError('category');
              }}
              items={suggestionCategories.map((item) => ({
                value: item,
                label: item,
              }))}
            />
            <FieldFoot>
              {errors.category && (
                <FieldError id="category-error">{errors.category}</FieldError>
              )}
            </FieldFoot>
          </FieldRoot>

          <TextField
            label="제목"
            data-field="title"
            value={title}
            maxLength={TITLE_MAX}
            error={errors.title}
            onChange={(event) => {
              setTitle(event.target.value);
              clearError('title');
            }}
          />

          <TextArea
            label="내용"
            data-field="body"
            value={body}
            maxLength={BODY_MAX}
            showCount
            rows={7}
            error={errors.body}
            onChange={(event) => {
              setBody(event.target.value);
              clearError('body');
            }}
          />

          <FieldRoot>
            <FieldLabel as="span" id="photo-label">
              사진<FieldOptional>선택</FieldOptional>
            </FieldLabel>
            <S.PhotoPicker>
              <PhotoIcon />
              <S.PhotoPickerText>
                최대 {MAX_PHOTOS}장, 장당 10MB. 얼굴이 나온 사진은 올리지
                말아주세요.
              </S.PhotoPickerText>
              <S.PhotoPickerButton size="small">
                파일 선택
                <VisuallyHidden
                  as="input"
                  type="file"
                  accept="image/*"
                  multiple
                  aria-labelledby="photo-label"
                  disabled={photos.length >= MAX_PHOTOS}
                  onChange={(event) => {
                    onPickPhotos(event.target.files);
                    event.target.value = '';
                  }}
                />
              </S.PhotoPickerButton>
            </S.PhotoPicker>
            {photos.length > 0 && (
              <S.PhotoList>
                {photos.map((file, index) => (
                  <li key={`${file.name}-${index}`}>
                    <span>{file.name}</span>
                    <TextButton
                      size="small"
                      aria-label={`${file.name} 빼기`}
                      onClick={() =>
                        setPhotos((prev) => prev.filter((_, i) => i !== index))
                      }
                    >
                      빼기
                    </TextButton>
                  </li>
                ))}
              </S.PhotoList>
            )}
            <FieldFoot>
              {errors.photos && (
                <FieldError role="status">{errors.photos}</FieldError>
              )}
            </FieldFoot>
          </FieldRoot>

          <Checkbox
            name="identity"
            label="익명으로 표시하기"
            checked={isAnonymous}
            onChange={(event) => setIsAnonymous(event.target.checked)}
          />

          {status === 'error' && (
            <Notice tone="warn" role="alert">
              보내지 못했습니다. 잠시 후 다시 시도해주세요.
            </Notice>
          )}

          <FormActions>
            <ButtonLink to="/suggestions">취소</ButtonLink>
            <Button
              type="submit"
              theme="accent"
              variant="primary"
              disabled={status === 'saving'}
            >
              건의 보내기
            </Button>
          </FormActions>
        </S.SuggestionForm>

        <SplitAside>
          {similar.length > 0 && (
            <Panel aria-labelledby="similar-title">
              <PanelTitle id="similar-title">
                비슷한 내용이 이미 있어요
              </PanelTitle>
              <S.SimilarList>
                {similar.map((agenda) => (
                  <li key={agenda.id}>
                    <S.SimilarTitle to={`/activity/${agenda.id}`}>
                      {agenda.title}
                    </S.SimilarTitle>
                    <S.SimilarMeta>
                      <Badge theme={statusTone.agenda[agenda.status]}>
                        {agenda.status}
                      </Badge>
                      건의 {agenda.suggestionCount}건 연결
                    </S.SimilarMeta>
                  </li>
                ))}
              </S.SimilarList>
              <PanelNote>
                같은 안건이라도 새 건의는 근거로 함께 반영됩니다.
              </PanelNote>
            </Panel>
          )}

          <Panel aria-labelledby="after-title">
            <PanelTitle id="after-title">보낸 다음에는</PanelTitle>
            <S.AfterSteps>
              <li>
                담당 부서가 3일 안에 확인하고 <strong>검토 중</strong>으로
                바꿉니다.
              </li>
              <li>
                바로 답할 수 있는 건 답변으로, 논의가 필요한 건{' '}
                <strong>안건</strong>으로 올립니다.
              </li>
              <li>
                상태가 바뀔 때마다 알림을 보내고, 반려할 때는 이유를 적습니다.
              </li>
            </S.AfterSteps>
          </Panel>
        </SplitAside>
      </SplitLayout>
    </>
  );
}
