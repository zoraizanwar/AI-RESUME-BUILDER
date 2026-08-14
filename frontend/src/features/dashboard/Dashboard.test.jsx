import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../../services/api';
import * as AuthContext from '../auth/AuthContext';

vi.mock('../../services/api');
vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AuthContext.useAuth.mockReturnValue({
      user: { username: 'testuser' }
    });
  });

  it('renders loading state initially or handles empty state', async () => {
    api.get.mockResolvedValueOnce({ data: [] }); // Resumes
    api.get.mockResolvedValueOnce({ data: [] }); // Dashboard stats? (if applicable)

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Using waitFor to assert something is rendered
    await waitFor(() => {
      expect(screen.getByText(/My Resumes/i)).toBeInTheDocument();
    });
  });
});
