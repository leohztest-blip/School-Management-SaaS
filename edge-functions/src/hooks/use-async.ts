'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

// ── Generic fetch hook ────────────────────────────────────────

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      if (mounted.current) {
        setData(result);
      }
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, deps);

  useEffect(() => {
    mounted.current = true;
    execute();
    return () => { mounted.current = false; };
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

// ── Debounced value hook ──────────────────────────────────────

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ── Pagination hook ───────────────────────────────────────────

export function usePagination(initialPage = 1, initialPerPage = 20) {
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / perPage);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page, perPage, total, totalPages, hasNext, hasPrev,
    setPage, setPerPage, setTotal,
    nextPage: () => setPage(p => Math.min(p + 1, totalPages)),
    prevPage: () => setPage(p => Math.max(p - 1, 1)),
    reset: () => { setPage(1); setTotal(0); },
  };
}

// ── Local storage hook ────────────────────────────────────────

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const set = useCallback((val: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof val === 'function' ? (val as (prev: T) => T)(prev) : val;
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(next));
      }
      return next;
    });
  }, [key]);

  return [value, set] as const;
}

// ── Infinite scroll hook ──────────────────────────────────────

export function useInfiniteScroll(callback: () => void, hasMore: boolean) {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          callback();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [callback, hasMore]);

  return loaderRef;
}

// ── Form submit hook ──────────────────────────────────────────

export function useFormSubmit<T>(
  submitFn: (data: T) => Promise<void>,
  options?: { onSuccess?: () => void; onError?: (err: string) => void }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: T) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await submitFn(data);
      setSuccess(true);
      options?.onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
      options?.onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit, loading, error, success };
}

// ── Window size hook ──────────────────────────────────────────

export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return {
    ...size,
    isMobile: size.width < 768,
    isTablet: size.width >= 768 && size.width < 1024,
    isDesktop: size.width >= 1024,
  };
}

// ── Clipboard hook ────────────────────────────────────────────

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return { copy, copied };
}
