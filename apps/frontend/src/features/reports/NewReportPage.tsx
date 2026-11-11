import { useState, type FormEvent } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useSession } from '../../app/session.ts';
import {
  Button,
  Notice,
  Select,
  TextArea,
  TextField,
} from '../../components/kit/index.ts';
import { listAgendas } from '../agendas/api.ts';
import { finishedStatuses } from '../agendas/types.ts';
import { listMembers } from '../members/api.ts';
import { createReport } from './api.ts';
import { reportKinds, type ReportKind } from './types.ts';
import './reports.css';

export async function newReportLoader() {
  const [agendas, members] = await Promise.all([listAgendas(), listMembers()]);
  return {
    agendas: agendas.filter(
      (agenda) => !finishedStatuses.includes(agenda.status),
    ),
    members,
  };
}

export function NewReportPage() {
  const { agendas, members } = useLoaderData<typeof newReportLoader>();
  const session = useSession();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<ReportKind>(reportKinds[0]);
  const [agendaId, setAgendaId] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'saving') return;
    if (!title.trim()) {
      setError('제목을 적어주세요.');
      return;
    }
    const agenda = agendas.find((item) => item.id === agendaId);
    setStatus('saving');
    try {
      const id = await createReport({
        title,
        kind,
        body,
        ...(agenda && { agenda: { id: agenda.id, title: agenda.title } }),
        author: session.name,
        department:
          members.find((member) => member.name === session.name)?.department ??
          '회장단',
      });
      await navigate(`/work/reports/${id}`);
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <nav className="breadcrumb" aria-label="경로">
        <Link to="/work/reports">보고서</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">새 보고서</span>
      </nav>
      <PageHeader title="보고서 쓰기" />

      <form
        className="panel panel--padded report-form"
        onSubmit={onSubmit}
        noValidate
      >
        <TextField
          label="제목"
          maxLength={60}
          autoFocus
          value={title}
          error={error}
          onChange={(event) => {
            setTitle(event.target.value);
            setError(undefined);
          }}
        />
        <div className="report-form__row">
          <Select
            label="종류"
            value={kind}
            onChange={(event) =>
              setKind(
                reportKinds.find((item) => item === event.target.value) ??
                  reportKinds[0],
              )
            }
          >
            {reportKinds.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
          <Select
            label="안건"
            optional
            value={agendaId}
            onChange={(event) => setAgendaId(event.target.value)}
          >
            <option value="">안건 없음</option>
            {agendas.map((agenda) => (
              <option key={agenda.id} value={agenda.id}>
                {agenda.id} {agenda.title}
              </option>
            ))}
          </Select>
        </div>
        <TextArea
          label="내용"
          rows={10}
          maxLength={5000}
          showCount
          placeholder="문단은 빈 줄로 나눕니다. 나중에 고칠 수 있습니다."
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        {status === 'error' && (
          <Notice tone="warn" role="alert">
            만들지 못했습니다. 잠시 후 다시 시도해주세요.
          </Notice>
        )}
        <div className="form-actions">
          <Link className="btn btn--ghost" to="/work/reports">
            취소
          </Link>
          <Button
            type="submit"
            variant="primary"
            disabled={status === 'saving'}
          >
            저장
          </Button>
        </div>
      </form>
    </>
  );
}
