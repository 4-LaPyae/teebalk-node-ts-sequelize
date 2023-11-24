import App from './app';

(async () => {
  const app = new App();

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
