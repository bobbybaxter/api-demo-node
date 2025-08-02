import { randomUUID } from 'crypto';
import { User, users } from '../../models/users-model';

export function createNewUser(user: User) {
  const newUser = {
    ...user,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  return newUser;
}
