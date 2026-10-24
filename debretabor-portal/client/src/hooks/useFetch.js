import { useCallback, useEffect, useState } from 'react';

// Runs an async loader and tracks { data, status: 'loading' | 'ready' | 'error', error }.
// Stale responses (fast navigation / language or filter changes) are ignored.
export default function useFetch(loader, deps = []) {
  const [state, setState] = useState({ data: null, status: 'loading', error: '' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading', error: '' }));
    loader()
      .then((data) => { if (!cancelled) setState({ data, status: 'ready', error: '' }); })
      .catch((err) => {
        if (!cancelled) setState({ data: null, status: 'error', error: err.response?.data?.message || 'Could not load this content right now.' });
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
