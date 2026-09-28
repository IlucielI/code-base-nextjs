import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Callout } from './Callout';

describe('Callout Component', () => {
  it('renders children and title correctly', () => {
    render(
      <Callout title="Notice" variant="info">
        This is a notification message.
      </Callout>
    );

    expect(screen.getByText('Notice')).toBeDefined();
    expect(screen.getByText('This is a notification message.')).toBeDefined();
  });

  it('renders warning variant properly', () => {
    render(
      <Callout title="Warning Alert" variant="warning">
        Please verify credentials.
      </Callout>
    );

    expect(screen.getByText('Warning Alert')).toBeDefined();
    expect(screen.getByText('Please verify credentials.')).toBeDefined();
  });
});
