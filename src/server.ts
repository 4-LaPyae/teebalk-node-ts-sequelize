import http from 'http';

import Logger, { loggerMiddleware } from '@freewilltokyo/logger';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';

import config from './config';

const log = new Logger('SERVER');

const HOST = config.get('host');
const PORT = config.get('port');

export default class Server {
  // properties are publicly exposed
  app: Express;
  httpServer: http.Server;

  constructor() {
    this.app = express();

    // attach middleware
    this.app.use(cors({ origin: /^https?:\/\/(localhost:[0-9]{2,5}|(dev\.|qa\.|www\.){0,1}(will-tells.com|tells-market.com))$/ }));
    this.app.use(helmet());
    this.app.use(
      express.json({
        limit: '8MB',
        verify(req: any, res: any, buf: any) {
          if (req.originalUrl.match('/stripe/webhook')) {
            req.rawBody = buf.toString();
          }
        }
      })
    );

    this.app.use(
      express.urlencoded({
        extended: true
      })
    );

    this.app.use(loggerMiddleware());
    this.app.set('views', __dirname + '/views');
    this.app.set('view engine', 'pug');

    this.httpServer = http.createServer(this.app);
  }

  start(cb?: () => void) {
    this.httpServer.listen(PORT, HOST, () => {
      log.info(`Server started at ${HOST}:${PORT}`);
      if (typeof cb === 'function') {
        cb();
      }
    });

    // attach event listeners to server
  }

  stop() {
    this.httpServer.close();
  }
}
