import { createErrorHandlerMiddleware } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';

import config from '../../src/config';
import { dependencyInjection } from './di-test';
import Server from '../../src/server';

const log = new Logger('AppTest');

class AppTest {
  public server: Server;

  constructor() {
    // Create HTTP server
    this.server = new Server();
  }

  start() {
    
    dependencyInjection(this.server.app);
        
    this.server.app.use(createErrorHandlerMiddleware(log, !['local', 'development'].includes(config.get('env'))));
    // Start HTTP server
    this.server.start();
  }

  async terminate(signal: NodeJS.Signals) {
    // by default Docker waits for 10 seconds before killing,
    // make sure you'll close all pending connections within 10 seconds
    log.info(`Received ${signal} signal. Terminating...`);
    // Close db connections
    // ...

    // Stop HTTP server
    await this.server.stop();
  }

  uncaughtException(error: Error) {
    log.error('Uncaught Exception:', error);
  }

  unhandledRejection(error: any, promise: Promise<any>) {
    log.error('Unhandled promise rejection.', 'Error: ', error, 'Promise: ', promise);
  }
}

export default AppTest;