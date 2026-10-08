import type { ReactNode } from 'react';

// sidebar component that can be expanded/collapsed

export function Sidebar({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <aside id="sidebar" className={open ? 'open' : undefined} inert={!open}>
      {children}
    </aside>
  );
}
