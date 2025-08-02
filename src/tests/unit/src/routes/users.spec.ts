import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../../../../../app';
import { User, users } from '../../../../models/users-model';

describe('Users Routes', () => {
  let testUsers: User[];

  beforeEach(() => {
    // Setup test data
    testUsers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-123-4567',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174001',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-987-6543',
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      },
      {
        id: '323e4567-e89b-12d3-a456-426614174002',
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@example.com',
        phone: '+1-555-111-2222',
        createdAt: '2024-01-03T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z',
      },
    ];

    // Clear and populate users array
    users.length = 0;
    users.push(...testUsers);
  });

  afterEach(() => {
    vi.clearAllMocks();
    users.length = 0;
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(testUsers);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(testUsers.length);
    });

    it('should return empty array when no users exist', async () => {
      users.length = 0;

      const response = await request(app).get('/users');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([]);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should return JSON content type', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return users with all required properties', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(StatusCodes.OK);
      response.body.forEach((user: User) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('firstName');
        expect(user).toHaveProperty('lastName');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('phone');
        expect(user).toHaveProperty('createdAt');
        expect(user).toHaveProperty('updatedAt');

        expect(typeof user.id).toBe('string');
        expect(typeof user.firstName).toBe('string');
        expect(typeof user.lastName).toBe('string');
        expect(typeof user.email).toBe('string');
        expect(typeof user.phone).toBe('string');
        expect(typeof user.createdAt).toBe('string');
        expect(typeof user.updatedAt).toBe('string');
      });
    });

    it('should handle query parameters gracefully', async () => {
      const response = await request(app).get('/users?page=1&limit=10');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(testUsers);
      // Note: Current implementation doesn't use query params, but should still work
    });

    it('should handle requests with various headers', async () => {
      const response = await request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .set('User-Agent', 'Test Agent')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(testUsers);
    });

    it('should return users in correct order', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body[0]).toEqual(testUsers[0]);
      expect(response.body[1]).toEqual(testUsers[1]);
      expect(response.body[2]).toEqual(testUsers[2]);
    });

    it('should handle concurrent requests correctly', async () => {
      const requests = Array(5)
        .fill(null)
        .map(() => request(app).get('/users'));

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toEqual(testUsers);
      });
    });

    it('should reflect changes when users array is modified', async () => {
      // First request
      let response = await request(app).get('/users');
      expect(response.body).toHaveLength(3);

      // Modify users array
      users.push({
        id: '423e4567-e89b-12d3-a456-426614174003',
        firstName: 'Alice',
        lastName: 'Brown',
        email: 'alice.brown@example.com',
        phone: '+1-555-333-4444',
        createdAt: '2024-01-04T00:00:00.000Z',
        updatedAt: '2024-01-04T00:00:00.000Z',
      });

      // Second request should reflect the change
      response = await request(app).get('/users');
      expect(response.body).toHaveLength(4);
      expect(response.body[3]).toHaveProperty('firstName', 'Alice');
    });

    it('should handle large number of users', async () => {
      // Add many users to test performance
      const manyUsers = Array(100)
        .fill(null)
        .map((_, index) => ({
          id: `${index.toString().padStart(3, '0')}e4567-e89b-12d3-a456-426614174000`,
          firstName: `User${index}`,
          lastName: `Test${index}`,
          email: `user${index}@example.com`,
          phone: `+1-555-${index.toString().padStart(3, '0')}-0000`,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }));

      users.length = 0;
      users.push(...manyUsers);

      const response = await request(app).get('/users');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveLength(100);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('HTTP Methods', () => {
    it('should return 404 for POST requests to /users', async () => {
      const response = await request(app).post('/users').send({ test: 'data' });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 404 for PUT requests to /users', async () => {
      const response = await request(app).put('/users').send({ test: 'data' });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 404 for DELETE requests to /users', async () => {
      const response = await request(app).delete('/users');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 404 for PATCH requests to /users', async () => {
      const response = await request(app).patch('/users').send({ test: 'data' });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('Route Parameters', () => {
    it('should return 404 for requests to /users with parameters', async () => {
      const response = await request(app).get('/users/123');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 404 for nested paths under /users', async () => {
      const response = await request(app).get('/users/some/nested/path');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('Error Handling', () => {
    it('should handle requests gracefully even with potential model issues', async () => {
      // Test that the route works normally even if we modify the users array
      const originalUsers = [...users];

      // Clear and restore users to simulate potential data changes
      users.length = 0;
      users.push(...originalUsers);

      const response = await request(app).get('/users');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(originalUsers);
    });

    it('should handle malformed Accept headers', async () => {
      const response = await request(app).get('/users').set('Accept', 'invalid-mime-type');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(testUsers);
    });
  });

  describe('Response Format', () => {
    it('should return users with consistent structure', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(StatusCodes.OK);

      // Verify each user has the same structure
      const firstUser = response.body[0];
      const userKeys = Object.keys(firstUser).sort();

      response.body.forEach((user: User) => {
        expect(Object.keys(user).sort()).toEqual(userKeys);
      });
    });

    it('should return valid JSON that can be parsed', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(StatusCodes.OK);
      expect(() => JSON.parse(JSON.stringify(response.body))).not.toThrow();
    });
  });
});
