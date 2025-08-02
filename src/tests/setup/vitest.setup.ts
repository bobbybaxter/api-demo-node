// this is run before every test suite
import { vi } from 'vitest';

vi.mock('src/app.ts', () => import('../mocks/mock-app.ts'));
vi.mock('src/bin/www.ts', () => import('../mocks/mock-server.ts'));
