import express, { NextFunction, Request, Response } from 'express';
import { createNewUser } from '../controllers/user/create-new-user';
import { getUserById } from '../controllers/user/get-user-by-id';
import { validateRequest } from '../middleware/validation-middleware';
import { userCreateSchema, userIdSchema } from '../validation/schemas/user.schema';

const router = express.Router();

router.get('/:id', validateRequest(userIdSchema, 'params'), (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const user = getUserById(id);

  res.send(user);
});

router.post('/', validateRequest(userCreateSchema, 'body'), (req: Request, res: Response, next: NextFunction) => {
  const user = createNewUser(req.body);

  res.status(201).send(user);
});

export default router;
