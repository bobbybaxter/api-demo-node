import { users } from '../../models/users-model';

export function getUserById(id: string) {
  const user = users.find((user) => user.id === id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}
