import express, { NextFunction, Request, Response } from 'express';
import userRouter from './user';
import usersRouter from './users';

const router = express.Router();

router.use('/user', userRouter);
router.use('/users', usersRouter);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.render('index', { title: 'Express' });
});

export default router;
