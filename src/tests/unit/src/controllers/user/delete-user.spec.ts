import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { deleteUser } from '../../../../../controllers/user/delete-user';
import { User, users } from '../../../../../models/users-model';

describe('deleteUser', () => {
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

  it('should delete an existing user and return the deleted user', () => {
    const userToDelete = testUsers[1]; // Jane Smith
    const initialLength = users.length;

    const result = deleteUser('2');

    expect(result).toEqual(userToDelete);
    expect(users).toHaveLength(initialLength - 1);
    expect(users.find((user) => user.id === '2')).toBeUndefined();
  });

  it('should remove the correct user from the users array', () => {
    const userToDelete = testUsers[0]; // John Doe
    const remainingUsers = testUsers.slice(1);

    deleteUser('1');

    expect(users).toHaveLength(2);
    expect(users).toEqual(remainingUsers);
    expect(users.find((user) => user.id === '1')).toBeUndefined();
  });

  it('should throw an error when user is not found', () => {
    expect(() => deleteUser('nonexistent-id')).toThrowError('User not found');
  });

  it('should throw an error when deleting from empty users array', () => {
    users.length = 0;

    expect(() => deleteUser('1')).toThrowError('User not found');
  });

  it('should handle deleting the first user in the array', () => {
    const firstUser = testUsers[0];
    const remainingUsers = testUsers.slice(1);

    const result = deleteUser('1');

    expect(result).toEqual(firstUser);
    expect(users).toEqual(remainingUsers);
  });

  it('should handle deleting the last user in the array', () => {
    const lastUser = testUsers[2];
    const remainingUsers = testUsers.slice(0, 2);

    const result = deleteUser('3');

    expect(result).toEqual(lastUser);
    expect(users).toEqual(remainingUsers);
  });

  it('should handle deleting when only one user exists', () => {
    // Keep only one user
    const singleUser = testUsers[0];
    users.length = 0;
    users.push(singleUser);

    const result = deleteUser('1');

    expect(result).toEqual(singleUser);
    expect(users).toHaveLength(0);
  });

  it('should not affect other users when deleting a specific user', () => {
    const userToDelete = testUsers[1]; // Jane Smith
    const unaffectedUsers = [testUsers[0], testUsers[2]]; // John and Bob

    deleteUser('2');

    expect(users).toHaveLength(2);
    expect(users).toEqual(unaffectedUsers);

    // Verify the remaining users are intact
    expect(users[0]).toEqual(testUsers[0]);
    expect(users[1]).toEqual(testUsers[2]);
  });

  it('should throw error for empty string ID', () => {
    expect(() => deleteUser('')).toThrowError('User not found');
  });

  it('should throw error for null or undefined ID', () => {
    expect(() => deleteUser(null as unknown as User['id'])).toThrowError('User not found');
    expect(() => deleteUser(undefined as unknown as User['id'])).toThrowError('User not found');
  });
});
