import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getUserById } from '../../../../../controllers/user/get-user-by-id';
import { User, users } from '../../../../../models/users-model';

describe('getUserById', () => {
  let testUsers: User[];

  beforeEach(() => {
    // Create test data
    testUsers = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-123-4567',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-987-6543',
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      },
      {
        id: '3',
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@example.com',
        phone: '+1-555-111-2222',
        createdAt: '2024-01-03T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z',
      },
    ];

    // Clear users array and add test data
    users.length = 0;
    users.push(...testUsers);
  });

  afterEach(() => {
    // Clean up after each test
    users.length = 0;
  });

  it('should return the correct user when found by ID', () => {
    const expectedUser = testUsers[1]; // Jane Smith

    const result = getUserById('2');

    expect(result).toEqual(expectedUser);
  });

  it('should return the first user when requesting by first ID', () => {
    const expectedUser = testUsers[0]; // John Doe

    const result = getUserById('1');

    expect(result).toEqual(expectedUser);
  });

  it('should return the last user when requesting by last ID', () => {
    const expectedUser = testUsers[2]; // Bob Wilson

    const result = getUserById('3');

    expect(result).toEqual(expectedUser);
  });

  it('should throw an error when user is not found', () => {
    expect(() => getUserById('nonexistent-id')).toThrowError('User not found');
  });

  it('should throw an error when searching in empty users array', () => {
    users.length = 0;

    expect(() => getUserById('1')).toThrowError('User not found');
  });

  it('should return exact user object reference from the array', () => {
    const result = getUserById('2');
    const directReference = users.find((user) => user.id === '2');

    expect(result).toBe(directReference);
    expect(result).toEqual(directReference);
  });

  it('should not modify the users array when getting a user', () => {
    const originalUsers = [...users];
    const originalLength = users.length;

    getUserById('2');

    expect(users).toHaveLength(originalLength);
    expect(users).toEqual(originalUsers);
  });

  it('should handle case-sensitive ID matching', () => {
    // Add a user with uppercase ID
    const upperCaseUser: User = {
      id: 'ABC123',
      firstName: 'Alice',
      lastName: 'Brown',
      email: 'alice.brown@example.com',
      phone: '+1-555-333-4444',
      createdAt: '2024-01-04T00:00:00.000Z',
      updatedAt: '2024-01-04T00:00:00.000Z',
    };
    users.push(upperCaseUser);

    const result = getUserById('ABC123');
    expect(result).toEqual(upperCaseUser);

    // Should not find with different case
    expect(() => getUserById('abc123')).toThrowError('User not found');
  });

  it('should throw error for empty string ID', () => {
    expect(() => getUserById('')).toThrowError('User not found');
  });

  it('should throw error for null or undefined ID', () => {
    expect(() => getUserById(null as unknown as User['id'])).toThrowError('User not found');
    expect(() => getUserById(undefined as unknown as User['id'])).toThrowError('User not found');
  });

  it('should work correctly when there is only one user', () => {
    // Keep only one user
    const singleUser = testUsers[0];
    users.length = 0;
    users.push(singleUser);

    const result = getUserById('1');

    expect(result).toEqual(singleUser);
  });

  it('should return user with all expected properties', () => {
    const result = getUserById('1');

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('firstName');
    expect(result).toHaveProperty('lastName');
    expect(result).toHaveProperty('email');
    expect(result).toHaveProperty('phone');
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('updatedAt');

    expect(typeof result.id).toBe('string');
    expect(typeof result.firstName).toBe('string');
    expect(typeof result.lastName).toBe('string');
    expect(typeof result.email).toBe('string');
    expect(typeof result.phone).toBe('string');
    expect(typeof result.createdAt).toBe('string');
    expect(typeof result.updatedAt).toBe('string');
  });
});
