import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../layout/Navbar.tsx';
import * as auth from '../auth-provider.js';

vi.mock('../auth-provider.js', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../mode-toggle.js', () => ({
  ModeToggle: () => null,
}));

describe('Navbar Component Tests', () => {
  it('should render the logo, browse link, and login/register when user is logged out', () => {
    vi.mocked(auth.useAuth).mockReturnValue({
      user: null,
      logout: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      loading: false,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('PasteBin')).toBeInTheDocument();
    expect(screen.getByText('Browse')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should render dashboard and logout actions when user is logged in', () => {
    vi.mocked(auth.useAuth).mockReturnValue({
      user: { email: 'test@example.com', id: 'user-1' },
      logout: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      loading: false,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('PasteBin')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
