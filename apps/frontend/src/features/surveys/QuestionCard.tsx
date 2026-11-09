import { useId } from 'react';
import { OptionCard } from '../../components/kit/index.ts';
import type { AnswerValue, Question } from './types.ts';

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
    <section className="question" aria-labelledby={headingId}>
      <h2 className="question__title" id={headingId}>
        <span className="question__number">{index + 1}</span>
        <span>
          {question.title}
          {question.required && (
            <span className="question__required">필수</span>
          )}
        </span>
      </h2>

      {question.type === 'single' && (
        <div
          className="question__options"
          role="radiogroup"
          aria-labelledby={headingId}
        >
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
        </div>
      )}

      {question.type === 'multiple' && (
        <>
          {question.maxSelections && (
            <p className="question__hint" id={hintId}>
              최대 {question.maxSelections}개까지 선택
            </p>
          )}
          <div
            className="question__options"
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
          </div>
        </>
      )}

      {question.type === 'scale' && (
        <div className="scale">
          <div
            className="scale__options"
            role="radiogroup"
            aria-labelledby={headingId}
          >
            {Array.from({ length: question.steps }, (_, i) => i + 1).map(
              (step) => (
                <label key={step} className="scale__item">
                  <input
                    type="radio"
                    className="scale__input visually-hidden"
                    name={id}
                    value={step}
                    checked={value === step}
                    onChange={() => onChange(step)}
                  />
                  <span className="scale__box">
                    {step}
                    {step === 1 && (
                      <span className="visually-hidden">
                        , {question.minLabel}
                      </span>
                    )}
                    {step === question.steps && (
                      <span className="visually-hidden">
                        , {question.maxLabel}
                      </span>
                    )}
                  </span>
                </label>
              ),
            )}
          </div>
          <div className="scale__labels" aria-hidden="true">
            <span>{question.minLabel}</span>
            <span>{question.maxLabel}</span>
          </div>
        </div>
      )}

      {question.type === 'text' && (
        <div className="question__text">
          <textarea
            className="field__control"
            aria-labelledby={headingId}
            maxLength={question.maxLength}
            placeholder={question.placeholder}
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => onChange(event.target.value)}
          />
          <span className="field__count">
            {typeof value === 'string' ? value.length : 0} /{' '}
            {question.maxLength}
          </span>
        </div>
      )}
    </section>
  );
}
