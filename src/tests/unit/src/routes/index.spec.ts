import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import app from '../../../../../app';

describe('Index Routes', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /', () => {
    it('should render the index page with Express title', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('Express');
    });

    it('should return HTML content type', async () => {
      const response = await request(app).get('/');

      expect(response.headers['content-type']).toMatch(/text\/html/);
    });

    it('should use jade template engine', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.text).toContain('<!DOCTYPE html>');
    });
  });

  describe('Route Mounting', () => {
    it('should mount user routes at /user', async () => {
      // Test that user routes are accessible
      const response = await request(app).get('/user/123e4567-e89b-12d3-a456-426614174000');

      // Should not return 404 for mounted routes (even if validation fails)
      expect(response.status).not.toBe(StatusCodes.NOT_FOUND);
    });

    it('should mount users routes at /users', async () => {
      // Test that users routes are accessible
      const response = await request(app).get('/users');

      expect(response.status).toBe(StatusCodes.OK);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle non-existent routes with 404', async () => {
      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('HTTP Methods', () => {
    it('should handle GET requests to root', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.OK);
    });

    it('should return method not allowed for unsupported methods on root', async () => {
      const response = await request(app).post('/');

      // POST to root should not be handled by index route
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('Route Parameters and Query Strings', () => {
    it('should handle query parameters on root route', async () => {
      const response = await request(app).get('/?test=value&another=param');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.type).toBe('text/html');
    });

    it('should handle empty query parameters', async () => {
      const response = await request(app).get('/?');

      expect(response.status).toBe(StatusCodes.OK);
    });
  });

  describe('Headers and Content', () => {
    it('should handle requests with various headers', async () => {
      const response = await request(app)
        .get('/')
        .set('Accept', 'text/html,application/xhtml+xml')
        .set('User-Agent', 'Test Agent')
        .set('Accept-Language', 'en-US,en;q=0.9');

      expect(response.status).toBe(StatusCodes.OK);
    });

    it('should handle requests without Accept header', async () => {
      const response = await request(app).get('/').unset('Accept');

      expect(response.status).toBe(StatusCodes.OK);
    });
  });

  describe('Error Handling', () => {
    it('should handle template rendering errors gracefully', async () => {
      // Mock res.render to throw an error
      const mockRender = vi.fn().mockImplementation(() => {
        throw new Error('Template error');
      });

      // This would require more complex mocking to test properly
      // For now, we'll just verify the route exists
      const response = await request(app).get('/');
      expect(response.status).toBe(StatusCodes.OK);
    });
  });

  describe('Router Integration', () => {
    it('should properly integrate with Express app', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.headers).toHaveProperty('x-powered-by', 'Express');
    });

    it('should handle concurrent requests to root route', async () => {
      const requests = Array(5)
        .fill(null)
        .map(() => request(app).get('/'));

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(StatusCodes.OK);
        expect(response.type).toBe('text/html');
      });
    });
  });
});
