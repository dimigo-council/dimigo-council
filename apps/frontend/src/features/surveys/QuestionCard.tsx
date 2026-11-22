import { useId } from 'react';
import { Input } from '../../dimi-ui-kit/index.ts';
import { CountedTextArea, OptionCard } from '../../components/ui/index.ts';
import * as S from './styles.ts';
import type { AnswerValue, Question } from './types.ts';

interface QuestionCardProps {
  question: Question;
  /** 1부터 */
  number: number;
  total: number;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * 설문 문항 하나 (Figma 학생 / 설문 참여).
 * 단일 선택은 Radio, 복수 선택은 CheckFill 옵션 줄, 단답형은 Input, 장문형은 글자 수가 붙은 Textarea.
 */
export function QuestionCard({
  question,
  number,
  total,
  value,
  onChange,
  disabled = false,
  error,
}: QuestionCardProps) {
  const id = useId();
  const headingId = `${id}-title`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : undefined;
  const title = `${number} / ${total} · ${question.title}`;

  return (
    <S.Question
      role={
        question.type === 'single'
          ? 'radiogroup'
          : question.type === 'multiple'
            ? 'group'
            : undefined
      }
      aria-labelledby={
        question.type === 'single' || question.type === 'multiple'
          ? headingId
          : undefined
      }
      aria-describedby={describedBy}
    >
      <S.QuestionHeading>
        <span id={headingId}>{title}</span>
        {question.type === 'multiple' && (
          <span>
            {question.maxSelections
              ? `최대 ${question.maxSelections}개까지 선택 가능`
              : '복수 선택 가능'}
          </span>
        )}
      </S.QuestionHeading>

      {question.type === 'single' &&
        question.options.map((option) => (
          <OptionCard
            key={option}
            name={id}
            value={option}
            title={option}
            checked={value === option}
            disabled={disabled}
            onChange={() => onChange(option)}
          />
        ))}

      {question.type === 'multiple' &&
        question.options.map((option) => {
          const selected = Array.isArray(value) ? value : [];
          const checked = selected.includes(option);
          const full =
            question.maxSelections !== undefined &&
            selected.length >= question.maxSelections;
          return (
            <OptionCard
              key={option}
              type="checkbox"
              value={option}
              title={option}
              checked={checked}
              disabled={disabled || (!checked && full)}
              onChange={() =>
                onChange(
                  checked
                    ? selected.filter((item) => item !== option)
                    : [...selected, option],
                )
              }
            />
          );
        })}

      {question.type === 'short' && (
        <Input
          aria-labelledby={headingId}
          aria-describedby={describedBy}
          maxLength={question.maxLength}
          placeholder={question.placeholder ?? '답을 적어 주세요'}
          value={typeof value === 'string' ? value : ''}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      {question.type === 'long' && (
        <CountedTextArea
          aria-labelledby={headingId}
          aria-describedby={describedBy}
          maxLength={question.maxLength}
          placeholder={question.placeholder ?? '자유롭게 적어 주세요'}
          value={typeof value === 'string' ? value : ''}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      {error && <S.QuestionError id={errorId}>{error}</S.QuestionError>}
    </S.Question>
  );
}
