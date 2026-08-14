import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JobMatchDashboard from './JobMatchDashboard';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../../services/api';

vi.mock('../../services/api');

describe('JobMatchDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <JobMatchDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Job Matcher/i)).toBeInTheDocument();
    });
  });
});
