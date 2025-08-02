import { users } from '../../models/users-model';

export function deleteUser(id: string) {
  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const deletedUser = users[userIndex];
  users.splice(userIndex, 1);

  return deletedUser;
}
