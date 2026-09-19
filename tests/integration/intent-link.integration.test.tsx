import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { IntentLink } from '../../src/intent-link';

/* -------------------------------------------------------------------------- */
/*                               Next Router Mock                             */
/* -------------------------------------------------------------------------- */

const routerMocks = vi.hoisted(() => ({
  prefetch: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => routerMocks,
}));

/* -------------------------------------------------------------------------- */
/*                                Next Link Mock                              */
/* -------------------------------------------------------------------------- */

vi.mock('next/link', () => {
  type MockLinkProps =
    AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
      children?: ReactNode;
      prefetch?: boolean;
    };

  const MockLink = forwardRef<
    HTMLAnchorElement,
    MockLinkProps
  >(
    (
      {
        href,
        children,
        prefetch: _prefetch,
        ...props
      },
      ref,
    ) => (
      <a
        ref={ref}
        href={href}
        {...props}
      >
        {children}
      </a>
    ),
  );

  MockLink.displayName = 'MockNextLink';

  return {
    default: MockLink,
  };
});

/* -------------------------------------------------------------------------- */
/*                         IntersectionObserver Mock                          */
/* -------------------------------------------------------------------------- */

let intersectionCallback:
  | IntersectionObserverCallback
  | undefined;

const observeMock = vi.fn();
const disconnectMock = vi.fn();

class MockIntersectionObserver {
  readonly root = null;

  readonly rootMargin = '0px';

  readonly scrollMargin = '0px';

  readonly thresholds = [0];

  constructor(
    callback: IntersectionObserverCallback,
  ) {
    intersectionCallback = callback;
  }

  observe = observeMock;

  disconnect = disconnectMock;

  unobserve = vi.fn();

  takeRecords = vi.fn(
    (): IntersectionObserverEntry[] => [],
  );
}

function createIntersectionEntry(
  target: Element,
  isIntersecting: boolean,
): IntersectionObserverEntry {
  return {
    target,
    isIntersecting,

    intersectionRatio: isIntersecting
      ? 1
      : 0,

    boundingClientRect:
      {} as DOMRectReadOnly,

    intersectionRect:
      {} as DOMRectReadOnly,

    rootBounds: null,

    time: 0,
  };
}

/* -------------------------------------------------------------------------- */
/*                                   Tests                                    */
/* -------------------------------------------------------------------------- */

describe('IntentLink integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    intersectionCallback = undefined;

    routerMocks.prefetch.mockReturnValue(
      undefined,
    );

    vi.stubGlobal(
      'IntersectionObserver',
      MockIntersectionObserver,
    );
  });

  /* ------------------------------------------------------------------------ */
  /*                         IntentLink -> Router                             */
  /* ------------------------------------------------------------------------ */

  it('prefetches the Next.js route on hover', async () => {
    render(
      <IntentLink
        href="/products/1"
        strategy="hover"
      >
        Product
      </IntentLink>,
    );

    fireEvent.mouseEnter(
      screen.getByRole('link'),
    );

    await waitFor(() => {
      expect(
        routerMocks.prefetch,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      routerMocks.prefetch,
    ).toHaveBeenCalledWith(
      '/products/1',
    );
  });

  it('prefetches the route on focus', async () => {
    render(
      <IntentLink
        href="/products/1"
        strategy="focus"
      >
        Product
      </IntentLink>,
    );

    fireEvent.focus(
      screen.getByRole('link'),
    );

    await waitFor(() => {
      expect(
        routerMocks.prefetch,
      ).toHaveBeenCalledWith(
        '/products/1',
      );
    });
  });

  it('prefetches the route on pointer down with intent strategy', async () => {
    render(
      <IntentLink
        href="/products/1"
        strategy="intent"
      >
        Product
      </IntentLink>,
    );

    fireEvent.pointerDown(
      screen.getByRole('link'),
    );

    await waitFor(() => {
      expect(
        routerMocks.prefetch,
      ).toHaveBeenCalledWith(
        '/products/1',
      );
    });
  });

  /* ------------------------------------------------------------------------ */
  /*                            Data Prefetching                              */
  /* ------------------------------------------------------------------------ */

  it('runs application data prefetchers', async () => {
    const prefetchProduct = vi
      .fn()
      .mockResolvedValue(undefined);

    const prefetchReviews = vi
      .fn()
      .mockResolvedValue(undefined);

    render(
      <IntentLink
        href="/products/1"
        strategy="hover"
        prefetchers={[
          prefetchProduct,
          prefetchReviews,
        ]}
      >
        Product
      </IntentLink>,
    );

    fireEvent.mouseEnter(
      screen.getByRole('link'),
    );

    await waitFor(() => {
      expect(
        prefetchProduct,
      ).toHaveBeenCalledTimes(1);

      expect(
        prefetchReviews,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      routerMocks.prefetch,
    ).toHaveBeenCalledWith(
      '/products/1',
    );
  });

  it('prefetches route and application data together', async () => {
    const prefetchData = vi
      .fn()
      .mockResolvedValue(undefined);

    render(
      <IntentLink
        href="/dashboard"
        strategy="hover"
        prefetchers={prefetchData}
      >
        Dashboard
      </IntentLink>,
    );

    fireEvent.mouseEnter(
      screen.getByRole('link'),
    );

    await waitFor(() => {
      expect(
        routerMocks.prefetch,
      ).toHaveBeenCalledWith(
        '/dashboard',
      );

      expect(
        prefetchData,
      ).toHaveBeenCalledTimes(1);
    });
  });

  /* ------------------------------------------------------------------------ */
  /*                             Route Disabled                               */
  /* ------------------------------------------------------------------------ */

  it('prefetches application data without route when prefetchRoute=false', async () => {
    const prefetchData = vi
      .fn()
      .mockResolvedValue(undefined);

    render(
      <IntentLink
        href="/products/1"
        strategy="hover"
        prefetchRoute={false}
        prefetchers={prefetchData}
      >
        Product
      </IntentLink>,
    );

    fireEvent.mouseEnter(
      screen.getByRole('link'),
    );

    await waitFor(() => {
      expect(
        prefetchData,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      routerMocks.prefetch,
    ).not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------------ */
  /*                               Deduplication                              */
  /* ------------------------------------------------------------------------ */

  it('deduplicates repeated warming of the same route', async () => {
    const prefetchData = vi
      .fn()
      .mockResolvedValue(undefined);

    render(
      <IntentLink
        href="/products/1"
        strategy="intent"
        prefetchers={prefetchData}
      >
        Product
      </IntentLink>,
    );

    const link =
      screen.getByRole('link');

    fireEvent.mouseEnter(link);

    fireEvent.focus(link);

    fireEvent.pointerDown(link);

    await waitFor(() => {
      expect(
        prefetchData,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      routerMocks.prefetch,
    ).toHaveBeenCalledTimes(1);
  });

  it('deduplicates while prefetch is still pending', async () => {
    let resolvePrefetch:
      | (() => void)
      | undefined;

    const pendingPrefetch = new Promise<void>(
      (resolve) => {
        resolvePrefetch = resolve;
      },
    );

    const prefetchData = vi.fn(
      () => pendingPrefetch,
    );

    render(
      <IntentLink
        href="/products/1"
        strategy="intent"
        prefetchers={prefetchData}
      >
        Product
      </IntentLink>,
    );

    const link =
      screen.getByRole('link');

    fireEvent.mouseEnter(link);

    fireEvent.focus(link);

    fireEvent.pointerDown(link);

    expect(
      prefetchData,
    ).toHaveBeenCalledTimes(1);

    expect(
      routerMocks.prefetch,
    ).toHaveBeenCalledTimes(1);

    resolvePrefetch?.();

    await pendingPrefetch;
  });

  /* ------------------------------------------------------------------------ */
  /*                              Failure Handling                            */
  /* ------------------------------------------------------------------------ */

  it('handles a rejected application prefetcher without unhandled failure', async () => {
    const successfulPrefetch = vi
      .fn()
      .mockResolvedValue(undefined);

    const failedPrefetch = vi
      .fn()
      .mockRejectedValue(
        new Error('API unavailable'),
      );

    render(
      <IntentLink
        href="/products/1"
        strategy="hover"
        prefetchers={[
          failedPrefetch,
          successfulPrefetch,
        ]}
      >
        Product
      </IntentLink>,
    );

    fireEvent.mouseEnter(
      screen.getByRole('link'),
    );

    await waitFor(() => {
      expect(
        failedPrefetch,
      ).toHaveBeenCalledTimes(1);

      expect(
        successfulPrefetch,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      routerMocks.prefetch,
    ).toHaveBeenCalledWith(
      '/products/1',
    );
  });

  /* ------------------------------------------------------------------------ */
  /*                              Visible Strategy                            */
  /* ------------------------------------------------------------------------ */

  it('prefetches route and data when link becomes visible', async () => {
    const prefetchData = vi
      .fn()
      .mockResolvedValue(undefined);

    render(
      <IntentLink
        href="/products"
        strategy="visible"
        prefetchers={prefetchData}
      >
        Products
      </IntentLink>,
    );

    const link =
      screen.getByRole('link');

    expect(
      routerMocks.prefetch,
    ).not.toHaveBeenCalled();

    intersectionCallback?.(
      [
        createIntersectionEntry(
          link,
          true,
        ),
      ],
      {} as IntersectionObserver,
    );

    await waitFor(() => {
      expect(
        routerMocks.prefetch,
      ).toHaveBeenCalledWith(
        '/products',
      );

      expect(
        prefetchData,
      ).toHaveBeenCalledTimes(1);
    });
  });

  /* ------------------------------------------------------------------------ */
  /*                            Immediate Strategy                            */
  /* ------------------------------------------------------------------------ */

  it('prefetches route and data immediately after mount', async () => {
    const prefetchData = vi
      .fn()
      .mockResolvedValue(undefined);

    render(
      <IntentLink
        href="/dashboard"
        strategy="immediate"
        prefetchers={prefetchData}
      >
        Dashboard
      </IntentLink>,
    );

    await waitFor(() => {
      expect(
        routerMocks.prefetch,
      ).toHaveBeenCalledWith(
        '/dashboard',
      );

      expect(
        prefetchData,
      ).toHaveBeenCalledTimes(1);
    });
  });

  /* ------------------------------------------------------------------------ */
  /*                             Different Routes                             */
  /* ------------------------------------------------------------------------ */

  it('prefetches different routes independently', async () => {
    const prefetchProduct = vi
      .fn()
      .mockResolvedValue(undefined);

    const prefetchDashboard = vi
      .fn()
      .mockResolvedValue(undefined);

    render(
      <>
        <IntentLink
          href="/products"
          strategy="hover"
          prefetchers={prefetchProduct}
        >
          Products
        </IntentLink>

        <IntentLink
          href="/dashboard"
          strategy="hover"
          prefetchers={prefetchDashboard}
        >
          Dashboard
        </IntentLink>
      </>,
    );

    fireEvent.mouseEnter(
      screen.getByRole('link', {
        name: 'Products',
      }),
    );

    fireEvent.mouseEnter(
      screen.getByRole('link', {
        name: 'Dashboard',
      }),
    );

    await waitFor(() => {
      expect(
        routerMocks.prefetch,
      ).toHaveBeenCalledTimes(2);
    });

    expect(
      routerMocks.prefetch,
    ).toHaveBeenCalledWith(
      '/products',
    );

    expect(
      routerMocks.prefetch,
    ).toHaveBeenCalledWith(
      '/dashboard',
    );

    expect(
      prefetchProduct,
    ).toHaveBeenCalledTimes(1);

    expect(
      prefetchDashboard,
    ).toHaveBeenCalledTimes(1);
  });
});