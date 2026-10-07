import type { ReactNode } from 'react';

type Props = {
  onClose: () => void;
  children: ReactNode;
};

export function InfoPanel({ onClose, children }: Props) {
  return (
    <div id="info-panel">
      <button id="info-close" aria-label="Close" onClick={onClose}>
        &times;
      </button>
      {children}
    </div>
  );
}