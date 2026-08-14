import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ATSAnalysisPage from './ATSAnalysisPage';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../../services/api';

vi.mock('../../services/api');

describe('ATSAnalysisPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    api.get.mockResolvedValueOnce({ data: { score: 85, feedback: 'Good' } });

    render(
      <MemoryRouter initialEntries={['/ats/1']}>
        <Routes>
          <Route path="/ats/:resumeId" element={<ATSAnalysisPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/ATS Resume Analyzer/i)).toBeInTheDocument();
    });
  });
});
