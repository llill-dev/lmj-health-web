import { setupServer } from 'msw/node';
import { authHandlers } from '@/test/handlers/auth';
import { serviceTypeHandlers } from '@/test/handlers/serviceTypes';

export const server = setupServer(...authHandlers, ...serviceTypeHandlers);
