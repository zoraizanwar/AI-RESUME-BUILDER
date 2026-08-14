import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import * as AuthContext from '../features/auth/AuthContext';
import { vi, describe, it, expect } from 'vitest';

vi.mock('../features/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  it('redirects to /login if user is not authenticated', () => {
    AuthContext.useAuth.mockReturnValue({ user: null });
    
    const { container } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute><div>Protected Content</div></ProtectedRoute>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(container.textContent).toBe('Login Page');
  });

  it('renders children if user is authenticated', () => {
    AuthContext.useAuth.mockReturnValue({ user: { id: 1, name: 'Test User' } });
    
    const { container } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute><div>Protected Content</div></ProtectedRoute>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(container.textContent).toBe('Protected Content');
  });
});
