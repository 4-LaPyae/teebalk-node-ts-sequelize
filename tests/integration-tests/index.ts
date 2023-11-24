import AppTest from './app-test';

const app = new AppTest();

(async () => {
  const terminate = async (signal: NodeJS.Signals) => {
    await app.terminate(signal);
    process.exit(0);
  };

  process.on('SIGINT', terminate);
  process.on('SIGTERM', terminate);

  process.on('uncaughtException', app.uncaughtException);
  process.on('unhandledRejection', app.unhandledRejection);

  await app.start();

})();

module.exports = app.server.app;