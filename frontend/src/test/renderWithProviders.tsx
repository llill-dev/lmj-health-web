import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { I18nProvider } from '@/i18n/provider';
import { directionForLocale, setCurrentLocale, type AppLocale } from '@/i18n/runtime';
import { createTestQueryClient } from '@/test/testQueryClient';

type ProviderOptions = {
  route?: string;
  queryClient?: QueryClient;
  withRouter?: boolean;
  locale?: AppLocale;
};

function TestProviders({
  children,
  route = '/',
  queryClient,
  withRouter = true,
  locale = 'ar',
}: {
  children: ReactNode;
  route?: string;
  queryClient: QueryClient;
  withRouter?: boolean;
  locale?: AppLocale;
}) {
  setCurrentLocale(locale);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
    document.documentElement.dir = directionForLocale(locale);
  }

  const content = withRouter ? (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  ) : (
    <>{children}</>
  );

  return (
    <I18nProvider>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            {content}
          </ToastProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </I18nProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route,
    queryClient = createTestQueryClient(),
    withRouter = true,
    locale = 'ar',
    ...options
  }: ProviderOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  const result = render(ui, {
    wrapper: ({ children }) => (
      <TestProviders
        route={route}
        queryClient={queryClient}
        withRouter={withRouter}
        locale={locale}
      >
        {children}
      </TestProviders>
    ),
    ...options,
  });

  return {
    ...result,
    queryClient,
  };
}
