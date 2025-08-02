import { User, users } from '../../models/users-model';

export function updateUser(id: string, user: User) {
  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const updatedUser = { ...users[userIndex], ...user, updatedAt: new Date().toISOString() };
  users[userIndex] = updatedUser;

  return updatedUser;
}
