import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { updateUser } from '../../../../../controllers/user/update-user';
import { User, users } from '../../../../../models/users-model';

describe('updateUser', () => {
  let testUsers: User[];
  const mockDate = new Date('2024-02-15T12:30:00.000Z');
  const mockDateString = '2024-02-15T12:30:00.000Z';

  beforeEach(() => {
    // Mock Date constructor and toISOString method
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

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
    vi.useRealTimers();
    vi.clearAllMocks();
    // Clean up after each test
    users.length = 0;
  });

  it('should update an existing user and return the updated user', () => {
    const updateData: Partial<User> = {
      firstName: 'Johnny',
      email: 'johnny.doe@example.com',
    };

    const result = updateUser('1', updateData as User);

    expect(result).toEqual({
      id: '1',
      firstName: 'Johnny',
      lastName: 'Doe', // preserved
      email: 'johnny.doe@example.com',
      phone: '+1-555-123-4567', // preserved
      createdAt: '2024-01-01T00:00:00.000Z', // preserved
      updatedAt: mockDateString, // updated
    });
  });

  it('should update the user in the users array', () => {
    const updateData: Partial<User> = {
      lastName: 'Updated',
    };

    updateUser('2', updateData as User);

    const updatedUser = users.find((user) => user.id === '2');
    expect(updatedUser?.lastName).toBe('Updated');
    expect(updatedUser?.updatedAt).toBe(mockDateString);
  });

  it('should preserve existing properties when updating partial data', () => {
    const originalUser = testUsers[0];
    const updateData: Partial<User> = {
      phone: '+1-555-999-8888',
    };

    const result = updateUser('1', updateData as User);

    expect(result.id).toBe(originalUser.id);
    expect(result.firstName).toBe(originalUser.firstName);
    expect(result.lastName).toBe(originalUser.lastName);
    expect(result.email).toBe(originalUser.email);
    expect(result.phone).toBe('+1-555-999-8888'); // updated
    expect(result.createdAt).toBe(originalUser.createdAt);
    expect(result.updatedAt).toBe(mockDateString); // updated
  });

  it('should always update the updatedAt timestamp', () => {
    const updateData: Partial<User> = {
      firstName: 'SameName', // even if updating to same value
    };

    const result = updateUser('1', updateData as User);

    expect(result.updatedAt).toBe(mockDateString);
    expect(result.updatedAt).not.toBe(testUsers[0].updatedAt);
  });

  it('should throw an error when user is not found', () => {
    const updateData: Partial<User> = {
      firstName: 'NonExistent',
    };

    expect(() => updateUser('nonexistent-id', updateData as User)).toThrowError('User not found');
  });

  it('should throw an error when updating in empty users array', () => {
    users.length = 0;
    const updateData: Partial<User> = {
      firstName: 'Test',
    };

    expect(() => updateUser('1', updateData as User)).toThrowError('User not found');
  });

  it('should handle updating all properties except id, createdAt', () => {
    const updateData: Partial<User> = {
      firstName: 'NewFirst',
      lastName: 'NewLast',
      email: 'new.email@example.com',
      phone: '+1-555-000-0000',
    };

    const result = updateUser('2', updateData as User);

    expect(result.firstName).toBe('NewFirst');
    expect(result.lastName).toBe('NewLast');
    expect(result.email).toBe('new.email@example.com');
    expect(result.phone).toBe('+1-555-000-0000');
    expect(result.id).toBe('2'); // preserved
    expect(result.createdAt).toBe(testUsers[1].createdAt); // preserved
    expect(result.updatedAt).toBe(mockDateString); // updated
  });

  it('should not affect other users when updating a specific user', () => {
    const updateData: Partial<User> = {
      firstName: 'Updated',
    };
    const unaffectedUsers = [testUsers[0], testUsers[2]];

    updateUser('2', updateData as User);

    // Check that other users remain unchanged
    expect(users[0]).toEqual(testUsers[0]);
    expect(users[2]).toEqual(testUsers[2]);

    // Check that only the target user was modified
    expect(users[1].firstName).toBe('Updated');
  });

  it('should handle updating when only one user exists', () => {
    // Keep only one user
    const singleUser = testUsers[0];
    users.length = 0;
    users.push(singleUser);

    const updateData: Partial<User> = {
      email: 'single.user@example.com',
    };

    const result = updateUser('1', updateData as User);

    expect(result.email).toBe('single.user@example.com');
    expect(users).toHaveLength(1);
    expect(users[0]).toEqual(result);
  });

  it('should create a new object and not mutate the original user', () => {
    const originalUser = { ...testUsers[0] };
    const updateData: Partial<User> = {
      firstName: 'NewName',
    };

    const result = updateUser('1', updateData as User);

    // Result should be different object reference
    expect(result).not.toBe(testUsers[0]);

    // Original test data should remain unchanged
    expect(testUsers[0]).toEqual(originalUser);
  });

  it('should throw error for empty string ID', () => {
    const updateData: Partial<User> = {
      firstName: 'Test',
    };

    expect(() => updateUser('', updateData as User)).toThrowError('User not found');
  });

  it('should throw error for null or undefined ID', () => {
    const updateData: Partial<User> = {
      firstName: 'Test',
    };

    expect(() => updateUser(null as unknown as User['id'], updateData as User)).toThrowError('User not found');
    expect(() => updateUser(undefined as unknown as User['id'], updateData as User)).toThrowError('User not found');
  });

  it('should handle empty update data object', () => {
    const originalUser = testUsers[0];
    const emptyUpdate = {};

    const result = updateUser('1', emptyUpdate as User);

    expect(result).toEqual({
      ...originalUser,
      updatedAt: mockDateString, // only updatedAt should change
    });
  });

  it('should handle updating with the same values as existing data', () => {
    const existingUser = testUsers[1];
    const sameData: Partial<User> = {
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      phone: existingUser.phone,
    };

    const result = updateUser('2', sameData as User);

    expect(result).toEqual({
      ...existingUser,
      updatedAt: mockDateString, // updatedAt should still be updated
    });
  });
});
