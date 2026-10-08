import { useEffect, useState } from 'react';
import { loadDataset } from './lib/data.ts';
import { Explorer } from './Explorer.tsx';
import type { Dataset } from './lib/types.ts';

type Load =
  { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: Dataset };

export default function App() {
  const [load, setLoad] = useState<Load>({ status: 'loading' });

  // load the dataset on mount
  useEffect(() => {
    let cancelled = false;
    loadDataset()
      .then(data => {
        if (!cancelled) setLoad({ status: 'ready', data });
      })
      .catch(err => {
        if (!cancelled) setLoad({ status: 'error', message: String(err) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (load.status === 'loading') return <p>Loading…</p>;
  if (load.status === 'error') return <p>{load.message}</p>;

  return <Explorer data={load.data} />;
}
