import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navbar } from './Navbar';

describe('Navbar Component', () => {
  it('renders brand name and navigation links', () => {
    render(
      <Navbar
        brandName="My Awesome App"
        links={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
        ]}
      />
    );

    expect(screen.getByText('My Awesome App')).toBeDefined();
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('About')).toBeDefined();
  });
});
