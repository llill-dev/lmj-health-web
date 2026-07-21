import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginForm from '@/components/auth/login/login-form';
import { resolveLoginErrorMessageAr } from '@/lib/auth/loginErrorMessages';
import { AuthFlowError, useAuthStore } from '@/store/authStore';
import { renderWithProviders } from '@/test/renderWithProviders';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

type MockAuthState = {
  user: { role: 'admin' | 'doctor' | 'patient' | 'secretary' | 'data-entry' } | null;
  login: ReturnType<typeof vi.fn>;
};

const mockAuthState: MockAuthState = {
  user: null,
  login: vi.fn(),
};

function renderLoginForm(route = '/login') {
  return renderWithProviders(
    <LoginForm
      onBack={vi.fn()}
      onSignUp={vi.fn()}
      onForgotPassword={vi.fn()}
      onOtpLogin={vi.fn()}
    />,
    { route },
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockAuthState.user = null;
    mockAuthState.login = vi.fn();

    vi.spyOn(useAuthStore, 'getState').mockImplementation(
      () => mockAuthState as unknown as ReturnType<typeof useAuthStore.getState>,
    );
  });

  it('validates email login and shows Arabic error for invalid email', async () => {
    const user = userEvent.setup();

    renderLoginForm();

    await user.type(
      screen.getByPlaceholderText('example@email.com'),
      'not-an-email',
    );
    await user.type(screen.getByPlaceholderText('password123'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));

    expect(
      await screen.findByText('يرجى إدخال بريد إلكتروني صالح'),
    ).toBeInTheDocument();
    expect(mockAuthState.login).not.toHaveBeenCalled();
  });

  it('switches to phone login, rejects short phone numbers, and updates the placeholder', async () => {
    const user = userEvent.setup();

    renderLoginForm();

    await user.click(screen.getByRole('button', { name: 'رقم الهاتف' }));

    const phoneInput = await screen.findByPlaceholderText('+963912345678');
    expect(phoneInput).toBeInTheDocument();

    await user.type(phoneInput, '091234');
    await user.type(screen.getByPlaceholderText('password123'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));

    expect(
      await screen.findByText('رقم الهاتف يجب أن يحتوي على 10 أرقام على الأقل'),
    ).toBeInTheDocument();
    expect(mockAuthState.login).not.toHaveBeenCalled();
  });

  it('submits successfully, shows a success toast, and redirects by user role', async () => {
    const user = userEvent.setup();

    mockAuthState.login = vi.fn().mockImplementation(async () => {
      mockAuthState.user = { role: 'doctor' };
      return {
        accountDeletionStatus: null,
        recoverUntil: null,
      };
    });

    renderLoginForm();

    await user.type(
      screen.getByPlaceholderText('example@email.com'),
      'doctor@example.com',
    );
    await user.type(screen.getByPlaceholderText('password123'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));

    await waitFor(() => {
      expect(mockAuthState.login).toHaveBeenCalledWith(
        'doctor@example.com',
        'secret1',
        'web',
      );
    });

    expect(
      await screen.findByText('تم تسجيل الدخول بنجاح. مرحباً بك في LMJ Health.'),
    ).toBeInTheDocument();

    expect(mockNavigate).toHaveBeenCalledWith('/doctor/dashboard', {
      replace: true,
    });
  });

  it('shows submitting state while the request is pending', async () => {
    const user = userEvent.setup();

    let resolveLogin: (() => void) | null = null;
    mockAuthState.login = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveLogin = () => {
            mockAuthState.user = { role: 'patient' };
            resolve({
              accountDeletionStatus: null,
              recoverUntil: null,
            });
          };
        }),
    );

    renderLoginForm();

    await user.type(
      screen.getByPlaceholderText('example@email.com'),
      'patient@example.com',
    );
    await user.type(screen.getByPlaceholderText('password123'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));

    expect(
      screen.getByRole('button', { name: 'جارٍ تسجيل الدخول...' }),
    ).toBeDisabled();

    resolveLogin?.();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'تسجيل الدخول' }),
      ).toBeEnabled();
    });
  });

  it('shows an inline alert and error toast when login fails', async () => {
    const user = userEvent.setup();
    const errorMessage = resolveLoginErrorMessageAr(
      'INVALID_CREDENTIALS',
      'email',
    );

    mockAuthState.login = vi.fn().mockRejectedValue(
      new AuthFlowError({
        code: 'INVALID_CREDENTIALS',
        message: 'invalid credentials',
      }),
    );

    renderLoginForm();

    await user.type(
      screen.getByPlaceholderText('example@email.com'),
      'doctor@example.com',
    );
    await user.type(screen.getByPlaceholderText('password123'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(errorMessage);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
