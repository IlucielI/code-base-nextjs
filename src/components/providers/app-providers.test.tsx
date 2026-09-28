import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { AppProviders } from './app-providers';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

describe('AppProviders', () => {
  it('renders children correctly and mounts provider tree', () => {
    render(
      <AppProviders>
        <div data-testid="test-child">Hello NextBase</div>
      </AppProviders>
    );

    expect(screen.getByTestId('test-child')).toBeDefined();
    expect(screen.getByText('Hello NextBase')).toBeDefined();
  });
});
