// tests/unit/intent-link.test.tsx
import '@testing-library/jest-dom/vitest';
import {
  fireEvent,
  render,
  screen,
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
/*                              useIntentRouter                               */
/* -------------------------------------------------------------------------- */

const mocks = vi.hoisted(() => ({
  prefetch: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  clearPrefetch: vi.fn(),
}));

vi.mock('../../src/use-intent-router', () => ({
  useIntentRouter: () => ({
    prefetch: mocks.prefetch,
    push: mocks.push,
    replace: mocks.replace,
    back: mocks.back,
    forward: mocks.forward,
    refresh: mocks.refresh,
    clearPrefetch: mocks.clearPrefetch,
  }),
}));

/* -------------------------------------------------------------------------- */
/*                                  Next Link                                 */
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
    ) => {
      return (
        <a
          ref={ref}
          href={href}
          {...props}
        >
          {children}
        </a>
      );
    },
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
const unobserveMock = vi.fn();

class MockIntersectionObserver
  implements IntersectionObserver
{
  readonly root: Element | Document | null = null;

  readonly rootMargin = '0px';

  readonly scrollMargin = '0px';

  readonly thresholds: readonly number[] = [0];

  constructor(
    callback: IntersectionObserverCallback,
  ) {
    intersectionCallback = callback;
  }

  observe = observeMock;

  disconnect = disconnectMock;

  unobserve = unobserveMock;

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

/**
 * Creates a valid IntersectionObserverEntry
 * for unit tests.
 */
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

describe('IntentLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    intersectionCallback = undefined;

    mocks.prefetch.mockResolvedValue(
      undefined,
    );

    vi.stubGlobal(
      'IntersectionObserver',
      MockIntersectionObserver,
    );
  });

  /* ------------------------------------------------------------------------ */
  /*                                Rendering                                 */
  /* ------------------------------------------------------------------------ */

  it('renders an anchor with the correct href', () => {
    render(
      <IntentLink href="/products/1">
        Product
      </IntentLink>,
    );

    const link = screen.getByRole('link', {
      name: 'Product',
    });

    expect(link).toHaveAttribute(
      'href',
      '/products/1',
    );
  });

  it('preserves anchor props', () => {
    render(
      <IntentLink
        href="/products"
        className="product-link"
        target="_blank"
        aria-label="Products page"
      >
        Products
      </IntentLink>,
    );

    const link = screen.getByRole('link', {
      name: 'Products page',
    });

    expect(link).toHaveClass(
      'product-link',
    );

    expect(link).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  /* ------------------------------------------------------------------------ */
  /*                              Hover Strategy                              */
  /* ------------------------------------------------------------------------ */

  it('prefetches on mouse enter with hover strategy', () => {
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

    expect(
      mocks.prefetch,
    ).toHaveBeenCalledTimes(1);

    expect(
      mocks.prefetch,
    ).toHaveBeenCalledWith(
      '/products/1',
      {
        prefetchers: [],
        prefetchRoute: true,
      },
    );
  });

  it('does not prefetch on focus with hover strategy', () => {
    render(
      <IntentLink
        href="/products/1"
        strategy="hover"
      >
        Product
      </IntentLink>,
    );

    fireEvent.focus(
      screen.getByRole('link'),
    );

    expect(
      mocks.prefetch,
    ).not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------------ */
  /*                              Focus Strategy                              */
  /* ------------------------------------------------------------------------ */

  it('prefetches on focus with focus strategy', () => {
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

    expect(
      mocks.prefetch,
    ).toHaveBeenCalledTimes(1);
  });

  it('does not prefetch on mouse enter with focus strategy', () => {
    render(
      <IntentLink
        href="/products/1"
        strategy="focus"
      >
        Product
      </IntentLink>,
    );

    fireEvent.mouseEnter(
      screen.getByRole('link'),
    );

    expect(
      mocks.prefetch,
    ).not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------------ */
  /*                              Intent Strategy                             */
  /* ------------------------------------------------------------------------ */

  it('prefetches on mouse enter with intent strategy', () => {
    render(
      <IntentLink
        href="/products/1"
        strategy="intent"
      >
        Product
      </IntentLink>,
    );

    fireEvent.mouseEnter(
      screen.getByRole('link'),
    );

    expect(
      mocks.prefetch,
    ).toHaveBeenCalledTimes(1);
  });

  it('prefetches on focus with intent strategy', () => {
    render(
      <IntentLink
        href="/products/1"
        strategy="intent"
      >
        Product
      </IntentLink>,
    );

    fireEvent.focus(
      screen.getByRole('link'),
    );

    expect(
      mocks.prefetch,
    ).toHaveBeenCalledTimes(1);
  });

  it('prefetches on pointer down with intent strategy', () => {
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

    expect(
      mocks.prefetch,
    ).toHaveBeenCalledTimes(1);
  });

  /* ------------------------------------------------------------------------ */
  /*                               None Strategy                              */
  /* ------------------------------------------------------------------------ */

  it('does not prefetch with none strategy', () => {
    render(
      <IntentLink
        href="/products/1"
        strategy="none"
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
      mocks.prefetch,
    ).not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------------ */
  /*                            Immediate Strategy                            */
  /* ------------------------------------------------------------------------ */

  it('prefetches immediately with immediate strategy', () => {
    render(
      <IntentLink
        href="/dashboard"
        strategy="immediate"
      >
        Dashboard
      </IntentLink>,
    );

    expect(
      mocks.prefetch,
    ).toHaveBeenCalledTimes(1);

    expect(
      mocks.prefetch,
    ).toHaveBeenCalledWith(
      '/dashboard',
      {
        prefetchers: [],
        prefetchRoute: true,
      },
    );
  });

  /* ------------------------------------------------------------------------ */
  /*                            Custom Prefetchers                            */
  /* ------------------------------------------------------------------------ */

  it('passes a single prefetcher', () => {
    const prefetchProduct = vi
      .fn()
      .mockResolvedValue(undefined);

    render(
      <IntentLink
        href="/products/1"
        strategy="hover"
        prefetchers={prefetchProduct}
      >
        Product
      </IntentLink>,
    );

    fireEvent.mouseEnter(
      screen.getByRole('link'),
    );

    expect(
      mocks.prefetch,
    ).toHaveBeenCalledWith(
      '/products/1',
      {
        prefetchers: [
          prefetchProduct,
        ],
        prefetchRoute: true,
      },
    );
  });

  it('passes multiple prefetchers', () => {
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

    expect(
      mocks.prefetch,
    ).toHaveBeenCalledWith(
      '/products/1',
      {
        prefetchers: [
          prefetchProduct,
          prefetchReviews,
        ],
        prefetchRoute: true,
      },
    );
  });

  /* ------------------------------------------------------------------------ */
  /*                             Route Prefetching                            */
  /* ------------------------------------------------------------------------ */

  it('passes prefetchRoute=false', () => {
    render(
      <IntentLink
        href="/products/1"
        strategy="hover"
        prefetchRoute={false}
      >
        Product
      </IntentLink>,
    );

    fireEvent.mouseEnter(
      screen.getByRole('link'),
    );

    expect(
      mocks.prefetch,
    ).toHaveBeenCalledWith(
      '/products/1',
      {
        prefetchers: [],
        prefetchRoute: false,
      },
    );
  });

  /* ------------------------------------------------------------------------ */
  /*                              User Handlers                               */
  /* ------------------------------------------------------------------------ */

  it('calls the consumer onMouseEnter handler', () => {
    const onMouseEnter = vi.fn();

    render(
      <IntentLink
        href="/products/1"
        strategy="hover"
        onMouseEnter={onMouseEnter}
      >
        Product
      </IntentLink>,
    );

    fireEvent.mouseEnter(
      screen.getByRole('link'),
    );

    expect(
      onMouseEnter,
    ).toHaveBeenCalledTimes(1);

    expect(
      mocks.prefetch,
    ).toHaveBeenCalledTimes(1);
  });

  it('does not prefetch when consumer prevents default', () => {
    render(
      <IntentLink
        href="/products/1"
        strategy="hover"
        onMouseEnter={(event) => {
          event.preventDefault();
        }}
      >
        Product
      </IntentLink>,
    );

    fireEvent.mouseEnter(
      screen.getByRole('link'),
    );

    expect(
      mocks.prefetch,
    ).not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------------ */
  /*                             Visible Strategy                             */
  /* ------------------------------------------------------------------------ */

  it('observes the link with visible strategy', () => {
    render(
      <IntentLink
        href="/products"
        strategy="visible"
      >
        Products
      </IntentLink>,
    );

    const link =
      screen.getByRole('link');

    expect(
      observeMock,
    ).toHaveBeenCalledTimes(1);

    expect(
      observeMock,
    ).toHaveBeenCalledWith(link);
  });

  it('prefetches when the link becomes visible', () => {
    render(
      <IntentLink
        href="/products"
        strategy="visible"
      >
        Products
      </IntentLink>,
    );

    const link =
      screen.getByRole('link');

    expect(
      mocks.prefetch,
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

    expect(
      mocks.prefetch,
    ).toHaveBeenCalledTimes(1);

    expect(
      mocks.prefetch,
    ).toHaveBeenCalledWith(
      '/products',
      {
        prefetchers: [],
        prefetchRoute: true,
      },
    );

    expect(
      disconnectMock,
    ).toHaveBeenCalled();
  });

  it('does not prefetch when the link is not visible', () => {
    render(
      <IntentLink
        href="/products"
        strategy="visible"
      >
        Products
      </IntentLink>,
    );

    const link =
      screen.getByRole('link');

    intersectionCallback?.(
      [
        createIntersectionEntry(
          link,
          false,
        ),
      ],
      {} as IntersectionObserver,
    );

    expect(
      mocks.prefetch,
    ).not.toHaveBeenCalled();
  });

  it('disconnects observer on unmount', () => {
    const { unmount } = render(
      <IntentLink
        href="/products"
        strategy="visible"
      >
        Products
      </IntentLink>,
    );

    unmount();

    expect(
      disconnectMock,
    ).toHaveBeenCalled();
  });
});