import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

import '@/styles/globals.css';
import App from '@/App';
import { MotionProvider } from '@/motion';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { NetworkStatusToasts } from '@/components/ui/NetworkStatusToasts';
import { queryClient } from '@/lib/queryClient';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MotionProvider>
          <ToastProvider>
            <NetworkStatusToasts />
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ToastProvider>
        </MotionProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
