import { useCallback, useEffect, useRef, useState } from "react";

// Runs an API call when the component mounts and whenever `deps` change.
//   const { data, meta, loading, error, reload } = useApi(() => listDoctors({ q }), [q]);
// Stale responses (from an older search, for example) are ignored.
export function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, meta: null, loading: true, error: null });
  const counter = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(() => {
    const id = ++counter.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcherRef
      .current()
      .then((res) => id === counter.current && setState({ data: res.data, meta: res.meta, loading: false, error: null }))
      .catch((err) => id === counter.current && setState((s) => ({ ...s, loading: false, error: err })));
  }, []);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, reload: run };
}
