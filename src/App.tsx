import { useEffect, useState } from 'react';
import { loadDataset } from './lib/data.ts';
import type { Dataset } from './lib/types.ts';

type Load =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: Dataset };

export default function App() {
  const [load, setLoad] = useState<Load>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    loadDataset()
      .then(data => { if (!cancelled) setLoad({ status: 'ready', data }); })
      .catch(err => { if (!cancelled) setLoad({ status: 'error', message: String(err) }); });
    return () => { cancelled = true; };
  }, []);

  if (load.status === 'loading') return <p>Loading…</p>;
  if (load.status === 'error') return <p>{load.message}</p>;

  const { meta, areas } = load.data;
  return (
    <p>
      {Object.keys(areas).length.toLocaleString()} areas, {meta.years[0]}–{meta.years.at(-1)}
    </p>
  );
}