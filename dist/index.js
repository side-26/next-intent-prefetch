'use client';

// src/intent-link.tsx
import Link from 'next/link';
import {
  useCallback as useCallback2,
  useEffect,
  useMemo,
  useRef as useRef2,
} from 'react';

// src/use-intent-router.ts
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';
function useIntentRouter() {
  const router = useRouter();
  const pendingRef = useRef(/* @__PURE__ */ new Map());
  const completedRef = useRef(/* @__PURE__ */ new Set());
  const prefetch = useCallback(
    (href, { prefetchers = [], prefetchRoute = true } = {}) => {
      const existing = pendingRef.current.get(href);
      if (existing) {
        return existing;
      }
      if (completedRef.current.has(href)) {
        return Promise.resolve();
      }
      const task = (async () => {
        try {
          if (prefetchRoute) {
            router.prefetch(href);
          }
          await Promise.allSettled(
            prefetchers.map((prefetcher) => prefetcher()),
          );
          completedRef.current.add(href);
        } finally {
          pendingRef.current.delete(href);
        }
      })();
      pendingRef.current.set(href, task);
      return task;
    },
    [router],
  );
  const push = useCallback(
    async (
      href,
      { prefetchers, prefetchRoute, warmBeforeNavigation = false, scroll } = {},
    ) => {
      const options = {
        ...(prefetchers !== void 0 && {
          prefetchers,
        }),
        ...(prefetchRoute !== void 0 && {
          prefetchRoute,
        }),
      };
      if (warmBeforeNavigation) {
        await prefetch(href, options);
      } else {
        void prefetch(href, options);
      }
      router.push(href, scroll === void 0 ? void 0 : { scroll });
    },
    [prefetch, router],
  );
  const replace = useCallback(
    async (
      href,
      { prefetchers, prefetchRoute, warmBeforeNavigation = false, scroll } = {},
    ) => {
      const options = {
        prefetchers,
        prefetchRoute,
      };
    },
    [prefetch, router],
  );
  const clearPrefetch = useCallback((href) => {
    if (href) {
      completedRef.current.delete(href);
      pendingRef.current.delete(href);
      return;
    }
    completedRef.current.clear();
    pendingRef.current.clear();
  }, []);
  return {
    push,
    replace,
    prefetch,
    clearPrefetch,
    back: router.back,
    forward: router.forward,
    refresh: router.refresh,
  };
}

// src/intent-link.tsx
import { jsx } from 'react/jsx-runtime';
function IntentLink({
  href,
  strategy = 'intent',
  prefetchers,
  prefetchRoute = true,
  rootMargin = '200px',
  threshold = 0,
  onMouseEnter,
  onFocus,
  onPointerDown,
  children,
  ...linkProps
}) {
  const router = useIntentRouter();
  const linkRef = useRef2(null);
  const normalizedPrefetchers = useMemo(() => {
    if (!prefetchers) {
      return [];
    }
    return Array.isArray(prefetchers) ? prefetchers : [prefetchers];
  }, [prefetchers]);
  const warm = useCallback2(() => {
    return router.prefetch(String(href), {
      prefetchers: [...normalizedPrefetchers],
      prefetchRoute,
    });
  }, [href, normalizedPrefetchers, prefetchRoute, router]);
  useEffect(() => {
    if (strategy !== 'immediate') {
      return;
    }
    void warm();
  }, [strategy, warm]);
  useEffect(() => {
    if (strategy !== 'visible') {
      return;
    }
    const element = linkRef.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }
        void warm();
        observer.disconnect();
      },
      {
        rootMargin,
        threshold,
      },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [strategy, warm, rootMargin, threshold]);
  const handleMouseEnter = (event) => {
    onMouseEnter?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (strategy === 'hover' || strategy === 'intent') {
      void warm();
    }
  };
  const handleFocus = (event) => {
    onFocus?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (strategy === 'focus' || strategy === 'intent') {
      void warm();
    }
  };
  const handlePointerDown = (event) => {
    onPointerDown?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (strategy === 'intent') {
      void warm();
    }
  };
  return /* @__PURE__ */ jsx(Link, {
    ...linkProps,
    ref: linkRef,
    href,
    prefetch: false,
    onMouseEnter: handleMouseEnter,
    onFocus: handleFocus,
    onPointerDown: handlePointerDown,
    children,
  });
}
export { IntentLink, useIntentRouter };
//# sourceMappingURL=index.js.map
