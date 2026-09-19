// src/use-intent-router.ts
'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

export type IntentPrefetcher = () => Promise<unknown>;

export interface IntentPrefetchOptions {
    prefetchers?: IntentPrefetcher[];
    prefetchRoute?: boolean;
}

export interface IntentNavigateOptions extends IntentPrefetchOptions {
    scroll?: boolean;
    warmBeforeNavigation?: boolean;
}

export function useIntentRouter() {
    const router = useRouter();

    const pendingRef = useRef(
        new Map<string, Promise<void>>(),
    );

    const completedRef = useRef(
        new Set<string>(),
    );

    const prefetch = useCallback(
        (
            href: string,
            {
                prefetchers = [],
                prefetchRoute = true,
            }: IntentPrefetchOptions = {},
        ): Promise<void> => {
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
                        prefetchers.map((prefetcher) =>
                            prefetcher(),
                        ),
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
            href: string,
            {
                prefetchers,
                prefetchRoute,
                warmBeforeNavigation = false,
                scroll,
            }: IntentNavigateOptions = {},
        ) => {
            const options: IntentPrefetchOptions = {
                ...(prefetchers !== undefined && {
                    prefetchers,
                }),
                ...(prefetchRoute !== undefined && {
                    prefetchRoute,
                }),
            };

            if (warmBeforeNavigation) {
                await prefetch(href, options);
            } else {
                void prefetch(href, options);
            }

            router.push(
                href,
                scroll === undefined
                    ? undefined
                    : { scroll },
            );
        },
        [prefetch, router],
    );

    const replace = useCallback(
        async (
            href: string,
            {
                prefetchers,
                prefetchRoute,
                warmBeforeNavigation = false,
                scroll,
            }: IntentNavigateOptions = {},
        ) => {
            const options = {
                prefetchers,
                prefetchRoute,
            };

            // ...
        },
        [prefetch, router],
    );

    const clearPrefetch = useCallback(
        (href?: string) => {
            if (href) {
                completedRef.current.delete(href);
                pendingRef.current.delete(href);

                return;
            }

            completedRef.current.clear();
            pendingRef.current.clear();
        },
        [],
    );

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