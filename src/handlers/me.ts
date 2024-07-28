import { findMe } from '@services/twitter';
import { RequestHandler } from 'express';

export const whoAmIHandler: RequestHandler = (req, res, next) => {
  findMe().then(result => {
    if (result.isErr()) {
      return next(result.error);
    }
    res.json({ username: result.value })
  }).catch(next)
}