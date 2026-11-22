import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router';
import type { Session } from '../../app/session.ts';
import { errorMessage } from '../../lib/api.ts';
import {
  Button,
  InputField,
  InputFieldDouble,
} from '../../dimi-ui-kit/index.ts';
import {
  Breadcrumbs,
  Checkbox,
  ChoiceGroup,
  TextButtonLink,
} from '../../components/ui/index.ts';
import { finishGoogle, signup, type SignupInput } from './api.ts';
import { CodeStep, EmailStep, type AuthFlow } from './AuthSteps.tsx';
import * as S from './styles.ts';

/** 앞 단계에서 넘긴 이메일. 없으면(주소로 바로 들어오면) 첫 단계로 돌려보낸다. */
function usePassedEmail() {
  const state: unknown = useLocation().state;
  if (state && typeof state === 'object' && 'email' in state) {
    const { email } = state;
    if (typeof email === 'string') return email;
  }
  return null;
}

function Title({ children }: { children: string }) {
  return <title>{`${children} | 디미고 학생회`}</title>;
}

/** 로그인·가입을 마친 뒤 갈 곳: 정보 입력이 남았으면 정보 입력, 아니면 홈 */
function homeOf(session: Session | null) {
  if (!session) return '/login';
  return session.onboarded ? '/' : '/signup/info';
}

/** 공통 / 로그인 */
export function LoginPage() {
  return (
    <>
      <Title>로그인</Title>
      <EmailStep flow="login" />
    </>
  );
}

/** 공통 / 회원가입 */
export function SignupPage() {
  return (
    <>
      <Title>회원가입</Title>
      <EmailStep flow="signup" />
    </>
  );
}

/** Google에서 돌아오는 주소 (/google/signup/callback, /google/login/callback) */
export function GoogleCallbackPage({ flow }: { flow: AuthFlow }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    // StrictMode에서 두 번 불려도 code는 한 번만 쓴다.
    if (started.current) return;
    started.current = true;
    const code = params.get('code');
    const state = params.get('state');
    const iss = params.get('iss') ?? undefined;
    if (!code || !state) {
      setError(
        params.get('error') === 'access_denied'
          ? 'Google 로그인을 취소했어요.'
          : 'Google 로그인 정보를 받지 못했어요. 처음부터 다시 시도해 주세요.',
      );
      return;
    }
    finishGoogle(flow, { code, state, iss })
      .then((session) => navigate(homeOf(session), { replace: true }))
      .catch((caught: unknown) =>
        setError(
          errorMessage(
            caught,
            'Google 로그인을 마치지 못했어요. 잠시 후 다시 시도해 주세요.',
          ),
        ),
      );
  }, [flow, navigate, params]);

  return (
    <>
      <Title>{flowLabel[flow]}</Title>
      <S.AuthCard aria-labelledby="auth-title" aria-busy={!error}>
        <S.AuthHeading>
          <h1 id="auth-title">{flowLabel[flow]}</h1>
          <p>{error ? '' : 'Google 계정을 확인하고 있어요.'}</p>
        </S.AuthHeading>
        {error && (
          <>
            <S.AuthError role="alert">{error}</S.AuthError>
            <S.Inset>
              <TextButtonLink theme="accent" to={`/${flow}`}>
                {flowLabel[flow]} 화면으로
              </TextButtonLink>
            </S.Inset>
          </>
        )}
      </S.AuthCard>
    </>
  );
}

const flowLabel: Record<AuthFlow, string> = {
  login: '로그인',
  signup: '회원가입',
};

/** 로그인 / 인증 코드, 회원가입 / 인증 코드 */
export function CodePage({ flow }: { flow: AuthFlow }) {
  const email = usePassedEmail();
  const navigate = useNavigate();
  if (!email) return <Navigate to={`/${flow}`} replace />;
  return (
    <>
      <Title>{`${flowLabel[flow]} 인증 코드`}</Title>
      <Breadcrumbs
        items={[
          { label: flowLabel[flow], to: `/${flow}` },
          { label: '인증 코드' },
        ]}
      />
      <CodeStep
        flow={flow}
        email={email}
        onVerified={(session) =>
          void navigate(homeOf(session), { replace: true })
        }
      />
    </>
  );
}

const NICKNAME_MAX = 80;

/** 회원가입 / 정보 입력 */
export function SignupInfoPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [withProfile, setWithProfile] = useState(true);
  const [grade, setGrade] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [gender, setGender] =
    useState<NonNullable<SignupInput['gender']>>('남성');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [tried, setTried] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const gradeValue = Number(grade);
  const classValue = Number(classNumber);
  const gradeOk = grade === '' || (gradeValue >= 1 && gradeValue <= 3);
  const classOk =
    classNumber === '' || (grade !== '' && classValue >= 1 && classValue <= 6);
  const nicknameOk = nickname.trim() !== '' && nickname.length <= NICKNAME_MAX;
  const valid =
    nicknameOk &&
    agreeTerms &&
    agreePrivacy &&
    (!withProfile || (gradeOk && classOk));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTried(true);
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    try {
      await signup({
        nickname: nickname.trim(),
        ...(withProfile && {
          grade: grade ? gradeValue : undefined,
          classNumber: classNumber ? classValue : undefined,
          gender,
        }),
      });
      await navigate('/', { replace: true });
    } catch (caught) {
      setError(
        errorMessage(caught, '가입하지 못했어요. 잠시 후 다시 시도해 주세요.'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Title>회원가입 정보 입력</Title>
      <Breadcrumbs
        items={[{ label: '회원가입', to: '/signup' }, { label: '정보 입력' }]}
      />
      <S.AuthCard aria-labelledby="auth-title">
        <S.AuthHeading>
          <h1 id="auth-title">회원가입</h1>
          <p>정보를 입력해 주세요.</p>
        </S.AuthHeading>
        <S.AuthForm onSubmit={onSubmit} noValidate>
          <InputField
            title="닉네임"
            autoComplete="nickname"
            maxLength={NICKNAME_MAX}
            placeholder="서비스에서 사용할 이름을 입력해 주세요"
            value={nickname}
            error={tried && !nicknameOk}
            subLabel={
              tried && !nicknameOk
                ? '닉네임을 입력해 주세요.'
                : `${NICKNAME_MAX}자까지 입력할 수 있어요.`
            }
            onChange={(event) => setNickname(event.target.value)}
          />
          <S.CheckRow>
            <Checkbox
              label="학년, 반, 성별 정보도 입력할게요"
              checked={withProfile}
              onChange={(event) => setWithProfile(event.target.checked)}
            />
          </S.CheckRow>
          {withProfile && (
            <>
              <InputFieldDouble
                title="학년과 반"
                subLabel={
                  classOk
                    ? '반을 입력하려면 학년도 입력해 주세요.'
                    : '학년(1~3)과 반(1~6)을 확인해 주세요.'
                }
                first={{
                  'aria-label': '학년',
                  inputMode: 'numeric',
                  maxLength: 1,
                  placeholder: '학년 (1~3)',
                  value: grade,
                  error: !gradeOk,
                  onChange: (event) =>
                    setGrade(event.target.value.replace(/\D/g, '')),
                }}
                second={{
                  'aria-label': '반',
                  inputMode: 'numeric',
                  maxLength: 1,
                  placeholder: '반 (1~6)',
                  value: classNumber,
                  error: !classOk,
                  onChange: (event) =>
                    setClassNumber(event.target.value.replace(/\D/g, '')),
                }}
              />
              <S.SegmentField>
                <span id="gender-label">성별</span>
                <ChoiceGroup
                  aria-labelledby="gender-label"
                  items={[
                    { value: '남성', label: '남성' },
                    { value: '여성', label: '여성' },
                  ]}
                  value={gender}
                  onChange={setGender}
                />
              </S.SegmentField>
            </>
          )}
          <S.CheckRows>
            <S.CheckRow>
              <Checkbox
                label="이용약관에 동의합니다. (필수)"
                checked={agreeTerms}
                aria-invalid={tried && !agreeTerms}
                onChange={(event) => setAgreeTerms(event.target.checked)}
              />
              <TextButtonLink size="small" to="/terms" target="_blank">
                보기
              </TextButtonLink>
            </S.CheckRow>
            <S.CheckRow>
              <Checkbox
                label="개인정보처리방침에 동의합니다. (필수)"
                checked={agreePrivacy}
                aria-invalid={tried && !agreePrivacy}
                onChange={(event) => setAgreePrivacy(event.target.checked)}
              />
              <TextButtonLink size="small" to="/privacy" target="_blank">
                보기
              </TextButtonLink>
            </S.CheckRow>
            {tried && !(agreeTerms && agreePrivacy) && (
              <S.AuthError role="alert">
                필수 약관에 모두 동의해 주세요.
              </S.AuthError>
            )}
          </S.CheckRows>
          {error && <S.AuthError role="alert">{error}</S.AuthError>}
          <S.Inset>
            <Button
              type="submit"
              size="large"
              theme="accent"
              variant="primary"
              fullWidth
              disabled={busy}
            >
              가입 완료
            </Button>
          </S.Inset>
        </S.AuthForm>
      </S.AuthCard>
    </>
  );
}
