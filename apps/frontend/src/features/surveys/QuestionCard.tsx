import { useId } from 'react';
import {
  ChoiceInput,
  FieldCount,
  OptionCard,
  VisuallyHidden,
} from '../../components/ui/index.ts';
import * as S from './styles.ts';
import type { AnswerValue, Question } from './types.ts';
import { TextArea } from '../../dimi-ui-kit/index.ts';

interface QuestionCardProps {
  question: Question;
  index: number;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}

export function QuestionCard({
  question,
  index,
  value,
  onChange,
}: QuestionCardProps) {
  const id = useId();
  const headingId = `${id}-title`;
  const hintId = `${id}-hint`;

  return (
    <S.Question aria-labelledby={headingId}>
      <S.QuestionTitle id={headingId}>
        <S.QuestionNumber>{index + 1}</S.QuestionNumber>
        <span>
          {question.title}
          {question.required && <S.QuestionRequired>필수</S.QuestionRequired>}
        </span>
      </S.QuestionTitle>

      {question.type === 'single' && (
        <S.QuestionOptions role="radiogroup" aria-labelledby={headingId}>
          {question.options.map((option) => (
            <OptionCard
              key={option}
              name={id}
              value={option}
              title={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
          ))}
        </S.QuestionOptions>
      )}

      {question.type === 'multiple' && (
        <>
          {question.maxSelections && (
            <S.QuestionHint id={hintId}>
              최대 {question.maxSelections}개까지 선택
            </S.QuestionHint>
          )}
          <S.QuestionOptions
            role="group"
            aria-labelledby={headingId}
            aria-describedby={question.maxSelections ? hintId : undefined}
          >
            {question.options.map((option) => {
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
                  disabled={!checked && full}
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
          </S.QuestionOptions>
        </>
      )}

      {question.type === 'scale' && (
        <S.Scale>
          <S.ScaleOptions role="radiogroup" aria-labelledby={headingId}>
            {Array.from({ length: question.steps }, (_, i) => i + 1).map(
              (step) => (
                <S.ScaleItem key={step}>
                  <ChoiceInput
                    type="radio"
                    name={id}
                    value={step}
                    checked={value === step}
                    onChange={() => onChange(step)}
                  />
                  <S.ScaleBox>
                    {step}
                    {step === 1 && (
                      <VisuallyHidden>, {question.minLabel}</VisuallyHidden>
                    )}
                    {step === question.steps && (
                      <VisuallyHidden>, {question.maxLabel}</VisuallyHidden>
                    )}
                  </S.ScaleBox>
                </S.ScaleItem>
              ),
            )}
          </S.ScaleOptions>
          <S.ScaleLabels aria-hidden="true">
            <span>{question.minLabel}</span>
            <span>{question.maxLabel}</span>
          </S.ScaleLabels>
        </S.Scale>
      )}

      {question.type === 'text' && (
        <S.QuestionText>
          <TextArea
            aria-labelledby={headingId}
            maxLength={question.maxLength}
            placeholder={question.placeholder}
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => onChange(event.target.value)}
          />
          <FieldCount>
            {typeof value === 'string' ? value.length : 0} /{' '}
            {question.maxLength}
          </FieldCount>
        </S.QuestionText>
      )}
    </S.Question>
  );
}
