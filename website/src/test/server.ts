import { setupServer } from 'msw/node';
import { authHandlers } from '@/test/handlers/auth';
import { deviceHandlers } from '@/test/handlers/devices';
import { serviceTypeHandlers } from '@/test/handlers/serviceTypes';
import { serviceProviderHandlers } from '@/test/handlers/serviceProviders';

export const server = setupServer(
  ...authHandlers,
  ...deviceHandlers,
  ...serviceTypeHandlers,
  ...serviceProviderHandlers,
);
