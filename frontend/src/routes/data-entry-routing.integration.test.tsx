import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '@/App';
import { renderWithProviders } from '@/test/renderWithProviders';
import { useAuthStore } from '@/store/authStore';

describe('Data-entry routing integration', () => {
  it('renders the data-entry dashboard route for an authenticated data-entry user', async () => {
    useAuthStore.setState({
      accessToken: 'access-token-1',
      refreshToken: 'refresh-token-1',
      refreshExpiresAt: '2030-01-01T00:00:00.000Z',
      isAuthenticated: true,
      user: {
        id: 'user-1',
        email: 'operator@example.com',
        phone: '+963912345678',
        role: 'data-entry',
        verified: true,
        name: 'مدخل البيانات',
      },
    });

    renderWithProviders(<App />, { route: '/data-entry/dashboard' });

    expect(
      await screen.findByRole('heading', { name: 'لوحة مدخل البيانات' }),
    ).toBeInTheDocument();
  });
});
