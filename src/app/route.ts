import { Application } from 'express';
import statuses from '@routes/statuses';
import posts from '@routes/posts';
import media from '@routes/media';
import me from '@routes/me';

export const route = (app: Application) => {
  app.use('/statuses', statuses);
  app.use('/posts', posts);
  app.use('/media', media);
  app.use('/me', me)
}