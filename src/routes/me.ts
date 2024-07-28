import { validateInput } from '@app/middlewares';
import { Router } from 'express';
import { whoAmIHandler } from 'handlers/me';

const router = Router();

router.get(
  '',
  validateInput,
  whoAmIHandler
);

export default router;