import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '@/styles/globals.css';
import App from '@/App';
import { MotionProvider } from '@/motion';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MotionProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MotionProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
