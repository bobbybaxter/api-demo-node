import express, { NextFunction, Request, Response } from 'express';
import { createNewUser } from '../controllers/user/create-new-user';
import { deleteUser } from '../controllers/user/delete-user';
import { getUserById } from '../controllers/user/get-user-by-id';
import { updateUser } from '../controllers/user/update-user';
import { validateRequest } from '../middleware/validation-middleware';
import { userCreateSchema, userIdSchema, userUpdateSchema } from '../validation/schemas/user.schema';

const router = express.Router();

router.delete('/:id', validateRequest(userIdSchema, 'params'), (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const user = deleteUser(id);

  res.send(user);
});

router.get('/:id', validateRequest(userIdSchema, 'params'), (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const user = getUserById(id);

  res.send(user);
});

router.patch(
  '/:id',
  validateRequest(userIdSchema, 'params'),
  validateRequest(userUpdateSchema, 'body'),
  (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = updateUser(id, req.body);

    res.send(user);
  },
);

router.post('/', validateRequest(userCreateSchema, 'body'), (req: Request, res: Response, next: NextFunction) => {
  const user = createNewUser(req.body);

  res.status(201).send(user);
});

export default router;
