import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../../../../../app';
import { User, users } from '../../../../models/users-model';

describe('User Routes', () => {
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
    ];

    // Clear and populate users array
    users.length = 0;
    users.push(...testUsers);
  });

  afterEach(() => {
    vi.clearAllMocks();
    users.length = 0;
  });

  describe('POST /user', () => {
    it('should create a new user with valid data', async () => {
      const newUser = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: '+1-555-111-2222',
      };

      const response = await request(app).post('/user').send(newUser).set('Content-Type', 'application/json');

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('firstName', newUser.firstName);
      expect(response.body).toHaveProperty('lastName', newUser.lastName);
      expect(response.body).toHaveProperty('email', newUser.email);
      expect(response.body).toHaveProperty('phone', newUser.phone);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteUser = {
        firstName: 'Alice',
        // lastName missing (required)
        email: 'alice.johnson@example.com',
        phone: '+1-555-111-2222',
      };

      const response = await request(app).post('/user').send(incompleteUser).set('Content-Type', 'application/json');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validation error');
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should return 400 for invalid email format', async () => {
      const userWithInvalidEmail = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'invalid-email',
        phone: '+1-555-111-2222',
      };

      const response = await request(app)
        .post('/user')
        .send(userWithInvalidEmail)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'email',
            message: expect.stringContaining('email'),
          }),
        ]),
      );
    });

    it('should return 400 for invalid phone format', async () => {
      const userWithInvalidPhone = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: 'invalid-phone',
      };

      const response = await request(app)
        .post('/user')
        .send(userWithInvalidPhone)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'phone',
            message: expect.any(String),
          }),
        ]),
      );
    });

    it('should strip unknown properties from request body', async () => {
      const userWithExtraProps = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: '+1-555-111-2222',
        unknownProp: 'should be removed',
        anotherId: 123,
      };

      const response = await request(app)
        .post('/user')
        .send(userWithExtraProps)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).not.toHaveProperty('unknownProp');
      expect(response.body).not.toHaveProperty('anotherId');
    });
  });

  describe('GET /user/:id', () => {
    it('should get user by valid ID', async () => {
      const userId = testUsers[0].id;

      const response = await request(app).get(`/user/${userId}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(testUsers[0]);
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app).get('/user/invalid-uuid');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validation error');
    });

    it('should return 500 for non-existent user with valid UUID', async () => {
      const nonExistentId = '999e4567-e89b-12d3-a456-426614174999';

      const response = await request(app).get(`/user/${nonExistentId}`);

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should handle URL encoded parameters', async () => {
      const userId = testUsers[0].id;

      const response = await request(app).get(`/user/${encodeURIComponent(userId)}`);

      expect(response.status).toBe(StatusCodes.OK);
    });
  });

  describe('PATCH /user/:id', () => {
    it('should update user with valid data and ID', async () => {
      const userId = testUsers[0].id;
      const updateData = {
        firstName: 'Johnny',
        email: 'johnny.doe@example.com',
      };

      const response = await request(app)
        .patch(`/user/${userId}`)
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('firstName', 'Johnny');
      expect(response.body).toHaveProperty('email', 'johnny.doe@example.com');
      expect(response.body).toHaveProperty('lastName', testUsers[0].lastName); // preserved
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 400 for invalid UUID in params', async () => {
      const updateData = { firstName: 'Johnny' };

      const response = await request(app)
        .patch('/user/invalid-uuid')
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('message', 'Validation error');
    });

    it('should return 400 for invalid email in body', async () => {
      const userId = testUsers[0].id;
      const updateData = {
        email: 'invalid-email-format',
      };

      const response = await request(app)
        .patch(`/user/${userId}`)
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'email',
            message: expect.any(String),
          }),
        ]),
      );
    });

    it('should update user with partial data', async () => {
      const userId = testUsers[0].id;
      const updateData = { phone: '+1-555-999-8888' };

      const response = await request(app)
        .patch(`/user/${userId}`)
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('phone', '+1-555-999-8888');
      expect(response.body).toHaveProperty('firstName', testUsers[0].firstName); // preserved
    });

    it('should return 500 for non-existent user with valid UUID', async () => {
      const nonExistentId = '999e4567-e89b-12d3-a456-426614174999';
      const updateData = { firstName: 'Johnny' };

      const response = await request(app)
        .patch(`/user/${nonExistentId}`)
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should handle empty update data', async () => {
      const userId = testUsers[0].id;

      const response = await request(app).patch(`/user/${userId}`).send({}).set('Content-Type', 'application/json');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('updatedAt');
    });
  });

  describe('DELETE /user/:id', () => {
    it('should delete user with valid ID', async () => {
      const userId = testUsers[0].id;
      const initialUserCount = users.length;

      const response = await request(app).delete(`/user/${userId}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(testUsers[0]);
      expect(users).toHaveLength(initialUserCount - 1);
      expect(users.find((user) => user.id === userId)).toBeUndefined();
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app).delete('/user/invalid-uuid');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('message', 'Validation error');
    });

    it('should return 500 for non-existent user with valid UUID', async () => {
      const nonExistentId = '999e4567-e89b-12d3-a456-426614174999';

      const response = await request(app).delete(`/user/${nonExistentId}`);

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should not affect other users when deleting', async () => {
      const userToDelete = testUsers[0];
      const otherUser = testUsers[1];

      const response = await request(app).delete(`/user/${userToDelete.id}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(users.find((user) => user.id === otherUser.id)).toEqual(otherUser);
    });
  });

  describe('Route Validation Integration', () => {
    it('should validate both params and body on PATCH', async () => {
      const response = await request(app)
        .patch('/user/invalid-uuid')
        .send({ email: 'invalid-email' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should handle missing Content-Type header', async () => {
      const newUser = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: '+1-555-111-2222',
      };

      const response = await request(app).post('/user').send(newUser);

      expect(response.status).toBe(StatusCodes.CREATED);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/user')
        .send('{"invalid": json}')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should handle empty request body', async () => {
      const response = await request(app).post('/user').send('').set('Content-Type', 'application/json');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });
  });
});
