import { useRef, type KeyboardEvent } from 'react';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  'aria-label': string;
  /** 탭 패널 id를 만들 때 쓰는 접두사. `${idPrefix}-panel-${value}` */
  idPrefix?: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  idPrefix,
  'aria-label': ariaLabel,
}: TabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (from: number, step: number) => {
    for (let i = 1; i <= items.length; i++) {
      const next = (from + step * i + items.length) % items.length;
      if (!items[next].disabled) {
        onChange(items[next].value);
        refs.current[next]?.focus();
        return;
      }
    }
  };

  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => move(index, 1),
      ArrowLeft: () => move(index, -1),
      Home: () => move(-1, 1),
      End: () => move(items.length, -1),
    };
    const action = keys[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  return (
    <div className="tabs" role="tablist" aria-label={ariaLabel}>
      {items.map((item, index) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            className="tabs__tab"
            id={idPrefix ? `${idPrefix}-tab-${item.value}` : undefined}
            aria-controls={
              idPrefix ? `${idPrefix}-panel-${item.value}` : undefined
            }
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {item.label}
            {item.count !== undefined && (
              <span className="count">{item.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
