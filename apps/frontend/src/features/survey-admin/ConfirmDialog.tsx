import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '../../dimi-ui-kit/index.ts';
import * as S from './styles.ts';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** 되돌릴 수 없는 동작(응답 삭제) 전에 묻는 창. 네이티브 dialog라 Esc·포커스 가두기는 브라우저가 맡는다. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  busy = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <S.ConfirmDialogRoot ref={ref} aria-labelledby={titleId} onClose={onClose}>
      <S.ConfirmDialogTitle id={titleId}>{title}</S.ConfirmDialogTitle>
      <S.ConfirmDialogBody>{children}</S.ConfirmDialogBody>
      <S.ConfirmDialogActions>
        <Button onClick={onClose} disabled={busy} autoFocus>
          취소
        </Button>
        <Button theme="negative" onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </Button>
      </S.ConfirmDialogActions>
    </S.ConfirmDialogRoot>
  );
}
