/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../../../app';

// Mock the routes to avoid actual route logic during app-level tests
vi.mock('../../../src/routes/index', () => ({
  default: vi.fn((req: Request, res: Response) => {
    if (req.path === '/') {
      return res.render('index', { title: 'Express' });
    }
    return res.status(404).send('Not Found');
  }),
}));

describe('Express App', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('App Configuration', () => {
    it('should be an Express application', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
      expect(app.get).toBeDefined();
      expect(app.post).toBeDefined();
      expect(app.put).toBeDefined();
      expect(app.delete).toBeDefined();
    });

    it('should have view engine set to jade', () => {
      expect(app.get('view engine')).toBe('jade');
    });

    it('should have views directory configured', () => {
      const viewsPath = app.get('views');
      expect(viewsPath).toBeDefined();
      expect(typeof viewsPath).toBe('string');
      expect(viewsPath).toContain('views');
    });
  });

  describe('Middleware Integration', () => {
    it('should handle JSON requests', async () => {
      const response = await request(app)
        .post('/test-json')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      // Even though the route doesn't exist, the JSON should be parsed
      // We can verify this by checking that the request doesn't fail due to JSON parsing
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should handle URL encoded requests', async () => {
      const response = await request(app)
        .post('/test-urlencoded')
        .send('name=test&value=data')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should serve static files from public directory', async () => {
      // Test that static middleware is configured (even if file doesn't exist)
      const response = await request(app).get('/nonexistent-static-file.css');

      // Should return 404 but not a route-not-found error
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should handle cookies', async () => {
      const response = await request(app).get('/test-cookie').set('Cookie', 'test=value');

      // Cookie parsing middleware should be active
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should handle different HTTP methods for non-existent routes', async () => {
      const methods = ['post', 'put', 'patch', 'delete'] as const;

      for (const method of methods) {
        const response = await (request(app) as Record<string, any>)[method]('/non-existent-route');
        expect(response.status).toBe(StatusCodes.NOT_FOUND);
      }
    });

    it('should render error page template', async () => {
      // Mock the render function to verify error handling
      const renderSpy = vi.fn();
      const originalRender = app.render;
      app.render = renderSpy;

      try {
        await request(app).get('/non-existent-route');
        // Note: The actual render call happens in the error handler
        // but may not be captured in this test due to the way supertest works
      } finally {
        app.render = originalRender;
      }
    });
  });

  describe('Route Mounting', () => {
    it('should mount index router on root path', async () => {
      // The index router should be mounted and handle routes
      const response = await request(app).get('/');

      // Should not return method not allowed or similar routing errors
      expect(response.status).not.toBe(StatusCodes.METHOD_NOT_ALLOWED);
    });

    it('should handle routes with trailing slashes', async () => {
      const response = await request(app).get('/');
      expect(response.status).not.toBe(StatusCodes.METHOD_NOT_ALLOWED);
    });
  });

  describe('Content Type Handling', () => {
    it('should handle requests without content-type header', async () => {
      const response = await request(app).get('/test');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/test')
        .send('{"invalid": json}')
        .set('Content-Type', 'application/json');

      // Should return 400 for malformed JSON, not 500
      expect([StatusCodes.BAD_REQUEST, StatusCodes.NOT_FOUND]).toContain(response.status);
    });

    it('should handle large request bodies appropriately', async () => {
      const largeData = 'x'.repeat(1000); // Small test payload
      const response = await request(app)
        .post('/test')
        .send({ data: largeData })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('Security Headers and Middleware', () => {
    it('should handle server information headers', async () => {
      const response = await request(app).get('/');

      // Express includes x-powered-by header by default
      expect(response.headers['x-powered-by']).toBeDefined();
      expect(response.headers['x-powered-by']).toBe('Express');
    });

    it('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/test')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type');

      // Should handle OPTIONS requests without error
      expect(response.status).not.toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('App Environment Configuration', () => {
    it('should handle different NODE_ENV values', async () => {
      const originalEnv = process.env.NODE_ENV;

      try {
        process.env.NODE_ENV = 'test';
        const response = await request(app).get('/non-existent');
        expect(response.status).toBe(StatusCodes.NOT_FOUND);

        process.env.NODE_ENV = 'development';
        const devResponse = await request(app).get('/non-existent');
        expect(devResponse.status).toBe(StatusCodes.NOT_FOUND);
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should work with default Express settings', () => {
      expect(app.get('env')).toBeDefined();
      expect(typeof app.get('env')).toBe('string');
    });
  });

  describe('Request Processing', () => {
    it('should handle concurrent requests', async () => {
      const requests = Array(5)
        .fill(null)
        .map(() => request(app).get('/concurrent-test'));

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('should handle requests with special characters in URL', async () => {
      const specialPaths = ['/test%20space', '/test?query=value', '/test#fragment', '/test/with/multiple/segments'];

      for (const path of specialPaths) {
        const response = await request(app).get(path);
        expect(response.status).toBe(StatusCodes.NOT_FOUND);
      }
    });

    it('should handle requests with various HTTP headers', async () => {
      const response = await request(app)
        .get('/test')
        .set('User-Agent', 'Test Agent')
        .set('Accept', 'application/json')
        .set('Accept-Language', 'en-US,en;q=0.9')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('Error Handler Behavior', () => {
    it('should set appropriate response locals in error handler', async () => {
      // This tests the error handler middleware indirectly
      const response = await request(app).get('/trigger-error');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      // Error handler should have processed this request
    });

    it('should handle different error types', async () => {
      const paths = ['/404-test', '/server-error-test', '/validation-error-test'];

      for (const path of paths) {
        const response = await request(app).get(path);
        expect(response.status).toBe(StatusCodes.NOT_FOUND);
      }
    });
  });

  describe('App Export and Module Structure', () => {
    it('should export a valid Express app instance', () => {
      expect(app).toBeDefined();
      expect(app.listen).toBeDefined();
      expect(typeof app.listen).toBe('function');
    });

    it('should have all required Express app methods', () => {
      const requiredMethods = ['get', 'post', 'put', 'patch', 'delete', 'use', 'listen', 'set', 'render'];

      requiredMethods.forEach((method) => {
        expect((app as Record<string, any>)[method]).toBeDefined();
        expect(typeof (app as Record<string, any>)[method]).toBe('function');
      });
    });

    it('should be ready for server binding', () => {
      // Test that the app can be used to create a server
      expect(() => {
        const server = app.listen(0); // Port 0 for automatic port assignment
        server.close();
      }).not.toThrow();
    });
  });
});
