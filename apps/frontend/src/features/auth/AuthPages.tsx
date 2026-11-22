import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
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
import { signup, type SignupInput } from './api.ts';
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

/** 공통 / 로그인 */
export function LoginPage() {
  const navigate = useNavigate();
  return (
    <>
      <Title>로그인</Title>
      {/* TODO: Google 로그인 연동. 지금은 바로 홈으로 간다. */}
      <EmailStep flow="login" onGoogle={() => void navigate('/')} />
    </>
  );
}

/** 공통 / 회원가입 */
export function SignupPage() {
  const navigate = useNavigate();
  return (
    <>
      <Title>회원가입</Title>
      {/* TODO: Google 가입 연동. 지금은 정보 입력 단계로 간다. */}
      <EmailStep flow="signup" onGoogle={() => void navigate('/signup/info')} />
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
        onVerified={() =>
          void navigate(flow === 'login' ? '/' : '/signup/info', {
            replace: true,
          })
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
    if (!valid) return;
    await signup({
      nickname: nickname.trim(),
      ...(withProfile && {
        grade: grade ? gradeValue : undefined,
        classNumber: classNumber ? classValue : undefined,
        gender,
      }),
    });
    await navigate('/', { replace: true });
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
          <S.Inset>
            <Button
              type="submit"
              size="large"
              theme="accent"
              variant="primary"
              fullWidth
            >
              가입 완료
            </Button>
          </S.Inset>
        </S.AuthForm>
      </S.AuthCard>
    </>
  );
}
