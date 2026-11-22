import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  Button,
  Divider,
  InputField,
  TextButton,
} from '../../dimi-ui-kit/index.ts';
import { TextButtonLink } from '../../components/ui/index.ts';
import { GoogleLogo } from './GoogleLogo.tsx';
import {
  isSchoolEmail,
  requestCode,
  RESEND_SECONDS,
  verifyCode,
} from './api.ts';
import * as S from './styles.ts';

export type AuthFlow = 'login' | 'signup';

const copy = {
  login: {
    title: '로그인',
    description: '학교 계정으로 로그인해 주세요.',
    google: 'Google 학교 계정으로 로그인',
    placeholder: 'studentcouncil@dimigo.hs.kr',
    switchText: '아직 계정이 없나요?',
    switchLabel: '회원가입',
    switchTo: '/signup',
    codeNote: '가입된 계정이면 메일이 도착해요.',
    submit: '로그인',
  },
  signup: {
    title: '회원가입',
    description: '학교 계정으로 가입해 주세요.',
    google: 'Google 학교 계정으로 가입',
    placeholder: '아이디@dimigo.hs.kr',
    switchText: '이미 계정이 있나요?',
    switchLabel: '로그인',
    switchTo: '/login',
    codeNote: '이미 가입한 주소라면 메일이 오지 않아요.',
    submit: '다음',
  },
} as const;

/** 로그인·회원가입 첫 단계: Google 계정 또는 학교 이메일로 인증 코드 받기 */
export function EmailStep({
  flow,
  onGoogle,
}: {
  flow: AuthFlow;
  onGoogle: () => void;
}) {
  const text = copy[flow];
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!isSchoolEmail(value)) {
      setError('@dimigo.hs.kr 계정만 사용할 수 있어요.');
      return;
    }
    await requestCode(value);
    // 이메일은 주소창에 남기지 않고 화면 상태로 넘긴다.
    await navigate(`/${flow}/code`, { state: { email: value } });
  };

  return (
    <S.AuthCard aria-labelledby="auth-title">
      <S.AuthHeading>
        <h1 id="auth-title">{text.title}</h1>
        <p>{text.description}</p>
      </S.AuthHeading>
      <S.GoogleSlot>
        <Button size="large" fullWidth onClick={onGoogle}>
          <GoogleLogo />
          {text.google}
        </Button>
      </S.GoogleSlot>
      <S.Inset>
        <Divider />
      </S.Inset>
      <S.AuthForm onSubmit={onSubmit} noValidate>
        <InputField
          title="학교 이메일"
          type="email"
          autoComplete="email"
          placeholder={text.placeholder}
          value={email}
          error={error !== ''}
          subLabel={error || '@dimigo.hs.kr 계정만 사용할 수 있어요.'}
          onChange={(event) => {
            setEmail(event.target.value);
            setError('');
          }}
        />
        <S.Inset>
          <Button
            type="submit"
            size="large"
            theme="accent"
            variant="primary"
            fullWidth
          >
            인증 코드 받기
          </Button>
        </S.Inset>
      </S.AuthForm>
      <S.AuthSwitch>
        {text.switchText}
        <TextButtonLink theme="accent" to={text.switchTo}>
          {text.switchLabel}
        </TextButtonLink>
      </S.AuthSwitch>
    </S.AuthCard>
  );
}

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return;
    const timer = window.setTimeout(() => setLeft(left - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [left]);
  return [left, () => setLeft(seconds)] as const;
}

/** 메일로 받은 6자리 인증 코드 입력 */
export function CodeStep({
  flow,
  email,
  onVerified,
}: {
  flow: AuthFlow;
  email: string;
  onVerified: () => void;
}) {
  const text = copy[flow];
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [left, restart] = useCountdown(RESEND_SECONDS);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError('숫자 6자리를 입력해 주세요.');
      return;
    }
    if (!(await verifyCode(email, code))) {
      setError('코드가 맞지 않아요. 다시 확인해 주세요.');
      return;
    }
    onVerified();
  };

  const onResend = async () => {
    await requestCode(email);
    restart();
  };

  return (
    <S.AuthCard aria-labelledby="auth-title">
      <S.AuthHeading>
        <h1 id="auth-title">인증 코드 입력</h1>
        <p>
          {email}로 코드를 보냈어요.{'\n'}
          {text.codeNote}
        </p>
      </S.AuthHeading>
      <S.AuthForm onSubmit={onSubmit} noValidate>
        <InputField
          title="인증 코드"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="숫자 6자리"
          value={code}
          error={error !== ''}
          subLabel={
            error || '코드는 10분 동안 유효하고, 5번까지 입력할 수 있어요.'
          }
          onChange={(event) => {
            setCode(event.target.value.replace(/\D/g, ''));
            setError('');
          }}
        />
        <S.Inset>
          <Button
            type="submit"
            size="large"
            theme="accent"
            variant="primary"
            fullWidth
          >
            {text.submit}
          </Button>
        </S.Inset>
      </S.AuthForm>
      <S.AuthLinks>
        <TextButtonLink to={`/${flow}`}>이메일 변경</TextButtonLink>
        <TextButton disabled={left > 0} onClick={onResend}>
          {left > 0 ? `${left}초 후 다시 받기` : '코드 다시 받기'}
        </TextButton>
      </S.AuthLinks>
    </S.AuthCard>
  );
}
