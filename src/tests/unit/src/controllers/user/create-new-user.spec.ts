import { randomUUID } from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createNewUser } from '../../../../../controllers/user/create-new-user';
import { User, users } from '../../../../../models/users-model';

// Mock crypto module
vi.mock('crypto', () => ({
  randomUUID: vi.fn(),
}));

describe('createNewUser', () => {
  const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockDate = new Date('2024-01-15T10:30:00.000Z');
  const mockDateString = '2024-01-15T10:30:00.000Z';

  beforeEach(() => {
    // Mock randomUUID to return a predictable value
    vi.mocked(randomUUID).mockReturnValue(mockUUID);

    // Mock Date constructor and toISOString method
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    // Clear the users array before each test
    users.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should create a new user with all required properties', () => {
    const inputUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
    };

    const result = createNewUser(inputUser as User);

    expect(result).toEqual({
      id: mockUUID,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      createdAt: mockDateString,
      updatedAt: mockDateString,
    });
  });

  it('should generate a unique ID using randomUUID', () => {
    const inputUser = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-987-6543',
    };

    createNewUser(inputUser as User);

    expect(randomUUID).toHaveBeenCalledOnce();
  });

  it('should set createdAt and updatedAt to current timestamp', () => {
    const inputUser = {
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob.wilson@example.com',
      phone: '+1-555-111-2222',
    };

    const result = createNewUser(inputUser as User);

    expect(result.createdAt).toBe(mockDateString);
    expect(result.updatedAt).toBe(mockDateString);
  });

  it('should add the new user to the users array', () => {
    const inputUser = {
      firstName: 'Alice',
      lastName: 'Brown',
      email: 'alice.brown@example.com',
      phone: '+1-555-333-4444',
    };

    const initialUsersLength = users.length;
    const result = createNewUser(inputUser as User);

    expect(users).toHaveLength(initialUsersLength + 1);
    expect(users[users.length - 1]).toEqual(result);
  });

  it('should not mutate the original input user object', () => {
    const inputUser = {
      firstName: 'Charlie',
      lastName: 'Davis',
      email: 'charlie.davis@example.com',
      phone: '+1-555-555-6666',
    };

    const originalInput = { ...inputUser };
    createNewUser(inputUser as User);

    expect(inputUser).toEqual(originalInput);
    expect(inputUser).not.toHaveProperty('id');
    expect(inputUser).not.toHaveProperty('createdAt');
    expect(inputUser).not.toHaveProperty('updatedAt');
  });

  it('should preserve all existing properties from input user', () => {
    const inputUser = {
      firstName: 'Diana',
      lastName: 'Miller',
      email: 'diana.miller@example.com',
      phone: '+1-555-777-8888',
    };

    const result = createNewUser(inputUser as User);

    expect(result.firstName).toBe(inputUser.firstName);
    expect(result.lastName).toBe(inputUser.lastName);
    expect(result.email).toBe(inputUser.email);
    expect(result.phone).toBe(inputUser.phone);
  });

  it('should handle multiple user creations correctly', () => {
    const user1 = {
      firstName: 'User',
      lastName: 'One',
      email: 'user1@example.com',
      phone: '+1-555-111-1111',
    };

    const user2 = {
      firstName: 'User',
      lastName: 'Two',
      email: 'user2@example.com',
      phone: '+1-555-222-2222',
    };

    const result1 = createNewUser(user1 as User);
    const result2 = createNewUser(user2 as User);

    expect(users).toHaveLength(2);
    expect(users[0]).toEqual(result1);
    expect(users[1]).toEqual(result2);
    expect(result1.id).toBe(mockUUID);
    expect(result2.id).toBe(mockUUID);
  });

  it('should return a new object and not reference the input', () => {
    const inputUser = {
      firstName: 'Reference',
      lastName: 'Test',
      email: 'reference.test@example.com',
      phone: '+1-555-999-0000',
    };

    const result = createNewUser(inputUser as User);

    expect(result).not.toBe(inputUser);
    expect(typeof result).toBe('object');
    expect(result.constructor).toBe(Object);
  });

  it('should handle edge case with empty string values', () => {
    const inputUser = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    };

    const result = createNewUser(inputUser as User);

    expect(result.firstName).toBe('');
    expect(result.lastName).toBe('');
    expect(result.email).toBe('');
    expect(result.phone).toBe('');
    expect(result.id).toBe(mockUUID);
    expect(result.createdAt).toBe(mockDateString);
    expect(result.updatedAt).toBe(mockDateString);
  });
});
