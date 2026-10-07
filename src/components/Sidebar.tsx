import { useState, type ReactNode } from 'react';

// sidebar component that can be expanded/collapsed

export function Sidebar({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside id="sidebar" className={expanded ? 'expanded' : undefined}>
      <div
        id="sidebar-handle"
        role="button"
        aria-label="Toggle sidebar"
        onClick={() => setExpanded(e => !e)}
      />
      {children}
    </aside>
  );
}
