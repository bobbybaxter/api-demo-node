import express, { NextFunction, Request, Response } from 'express';
import { users } from '../models/users-model';

const router = express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send(users);
});

export default router;
