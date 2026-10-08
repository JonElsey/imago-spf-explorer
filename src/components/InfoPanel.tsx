import type { ReactNode } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function InfoPanel({ open, onClose, children }: Props) {
  return (
    <div id="info-panel" className={open ? 'open' : undefined} inert={!open}>
      <button id="info-close" aria-label="Close" onClick={onClose}>
        &times;
      </button>
      {children}
    </div>
  );
}
