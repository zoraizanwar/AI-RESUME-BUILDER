import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import api from '../../services/api';

vi.mock('../../services/api');

const TestComponent = () => {
  const { user, login, logout, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div data-testid="user">{user ? user.username : 'No User'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with no user if no token', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('No User');
    });
  });

  it('fetches user if token exists', async () => {
    localStorage.setItem('access', 'fake-token');
    api.get.mockResolvedValueOnce({ data: { id: 1, username: 'testuser' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('testuser');
    });
    expect(api.get).toHaveBeenCalledWith('/auth/me/');
  });
});
