// src/intent-link.tsx
'use client';

import Link from 'next/link';
import {
    type ComponentProps,
    type FocusEvent,
    type MouseEvent,
    type PointerEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react';

import {
    type IntentPrefetcher,
    useIntentRouter,
} from './use-intent-router';

export type IntentStrategy =
    | 'none'
    | 'hover'
    | 'focus'
    | 'intent'
    | 'visible'
    | 'immediate';

type NextLinkProps = ComponentProps<typeof Link>;

export interface IntentLinkProps
    extends Omit<NextLinkProps, 'prefetch'> {
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
    prefetchers?:
    | IntentPrefetcher
    | readonly IntentPrefetcher[];

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

export function IntentLink({
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
}: IntentLinkProps) {
    const router = useIntentRouter();

    const linkRef =
        useRef<HTMLAnchorElement>(null);

    const normalizedPrefetchers =
        useMemo<readonly IntentPrefetcher[]>(
            () => {
                if (!prefetchers) {
                    return [];
                }

                return Array.isArray(prefetchers)
                    ? prefetchers
                    : [prefetchers];
            },
            [prefetchers],
        );

    const warm = useCallback(() => {
        return router.prefetch(String(href), {
            prefetchers: [
                ...normalizedPrefetchers,
            ],
            prefetchRoute,
        });
    }, [
        href,
        normalizedPrefetchers,
        prefetchRoute,
        router,
    ]);

    /*
     * Immediate strategy
     */
    useEffect(() => {
        if (strategy !== 'immediate') {
            return;
        }

        void warm();
    }, [strategy, warm]);

    /*
     * Visible strategy
     */
    useEffect(() => {
        if (strategy !== 'visible') {
            return;
        }

        const element = linkRef.current;

        if (!element) {
            return;
        }

        const observer =
            new IntersectionObserver(
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
    }, [
        strategy,
        warm,
        rootMargin,
        threshold,
    ]);

    const handleMouseEnter = (
        event: MouseEvent<HTMLAnchorElement>,
    ) => {
        onMouseEnter?.(event);

        if (event.defaultPrevented) {
            return;
        }

        if (
            strategy === 'hover' ||
            strategy === 'intent'
        ) {
            void warm();
        }
    };

    const handleFocus = (
        event: FocusEvent<HTMLAnchorElement>,
    ) => {
        onFocus?.(event);

        if (event.defaultPrevented) {
            return;
        }

        if (
            strategy === 'focus' ||
            strategy === 'intent'
        ) {
            void warm();
        }
    };

    const handlePointerDown = (
        event: PointerEvent<HTMLAnchorElement>,
    ) => {
        onPointerDown?.(event);

        if (event.defaultPrevented) {
            return;
        }

        if (strategy === 'intent') {
            void warm();
        }
    };

    return (
        <Link
            {...linkProps}
            ref={linkRef}
            href={href}

            /*
             * Disable Next's automatic Link prefetch
             * because IntentLink explicitly controls
             * route prefetch through useIntentRouter.
             */
            prefetch={false}

            onMouseEnter={handleMouseEnter}
            onFocus={handleFocus}
            onPointerDown={handlePointerDown}
        >
            {children}
        </Link>
    );
}