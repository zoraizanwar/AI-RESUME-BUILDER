import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResumeEditor from './ResumeEditor';
import { vi, describe, it, expect } from 'vitest';
import * as ResumeBuilderContext from './ResumeBuilderContext';

vi.mock('./ResumeBuilderContext', () => ({
  useResumeBuilder: vi.fn(),
}));

// Mock LivePreview to avoid deeper rendering issues
vi.mock('./LivePreview', () => ({
  default: () => <div>Live Preview Component</div>
}));
// Mock Wizard
vi.mock('./Wizard', () => ({
  default: () => <div>Wizard Component</div>
}));

describe('ResumeEditor', () => {
  it('renders correctly', () => {
    ResumeBuilderContext.useResumeBuilder.mockReturnValue({
      resume: { id: 1 },
      version: { id: 1 },
      loadData: vi.fn(),
      changeVersion: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ResumeEditor />
      </MemoryRouter>
    );

    expect(screen.getByText(/Live Preview Component/i)).toBeInTheDocument();
    expect(screen.getByText(/Wizard Component/i)).toBeInTheDocument();
  });
});

