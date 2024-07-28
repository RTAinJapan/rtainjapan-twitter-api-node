import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { route } from './route';
import { logging } from './logging';
import { handleTwitterError } from './middlewares';
import cors from 'cors';
import { config } from './config';
import bootstrap from './bootstrap';

const app = express();

app.use(express.json({
  limit: '1024m'
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
if (config.cors) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cors({ origin: config.cors.origin }));
}

logging(app);
route(app);

app.use(handleTwitterError);

void bootstrap();

export default app;
