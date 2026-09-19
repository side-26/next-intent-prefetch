import * as react from 'react';
import { ComponentProps } from 'react';
import Link from 'next/link';

type IntentPrefetcher = () => Promise<unknown>;
interface IntentPrefetchOptions {
  prefetchers?: IntentPrefetcher[];
  prefetchRoute?: boolean;
}
interface IntentNavigateOptions extends IntentPrefetchOptions {
  scroll?: boolean;
  warmBeforeNavigation?: boolean;
}
declare function useIntentRouter(): {
  push: (
    href: string,
    {
      prefetchers,
      prefetchRoute,
      warmBeforeNavigation,
      scroll,
    }?: IntentNavigateOptions,
  ) => Promise<void>;
  replace: (
    href: string,
    {
      prefetchers,
      prefetchRoute,
      warmBeforeNavigation,
      scroll,
    }?: IntentNavigateOptions,
  ) => Promise<void>;
  prefetch: (
    href: string,
    { prefetchers, prefetchRoute }?: IntentPrefetchOptions,
  ) => Promise<void>;
  clearPrefetch: (href?: string) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
};

type IntentStrategy =
  'none' | 'hover' | 'focus' | 'intent' | 'visible' | 'immediate';
type NextLinkProps = ComponentProps<typeof Link>;
interface IntentLinkProps extends Omit<NextLinkProps, 'prefetch'> {
  /**
   * Controls when custom warming starts.
   *
   * @default "intent"
   */
  strategy?: IntentStrategy;
  /**
   * Application-level data prefetchers.
   *
   * They should be read-only / idempotent operations.
   */
  prefetchers?: IntentPrefetcher | readonly IntentPrefetcher[];
  /**
   * Whether IntentLink should explicitly call
   * router.prefetch(href).
   *
   * @default true
   */
  prefetchRoute?: boolean;
  /**
   * IntersectionObserver rootMargin used by
   * strategy="visible".
   *
   * @default "200px"
   */
  rootMargin?: string;
  /**
   * IntersectionObserver threshold.
   *
   * @default 0
   */
  threshold?: number;
}
declare function IntentLink({
  href,
  strategy,
  prefetchers,
  prefetchRoute,
  rootMargin,
  threshold,
  onMouseEnter,
  onFocus,
  onPointerDown,
  children,
  ...linkProps
}: IntentLinkProps): react.JSX.Element;

export {
  IntentLink,
  type IntentLinkProps,
  type IntentNavigateOptions,
  type IntentPrefetchOptions,
  type IntentPrefetcher,
  type IntentStrategy,
  useIntentRouter,
};
