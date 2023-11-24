import { SQSConsumer, SQSMessage } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import autobind from 'autobind-decorator';

import { TaskIdEnum } from './enums';
import { IWorkerTask } from './tasks/_base';

const log = new Logger('WORKER:CloudWatchEventListener');

export interface ICloudWatchEventListenerOptions {
  queueUrl: any;
  sqs: any;
}

@autobind
export class CloudWatchEventListener {
  private tasks: IWorkerTask[];
  private sqsConsumer: SQSConsumer;

  constructor(tasks: IWorkerTask[], options: ICloudWatchEventListenerOptions) {
    this.tasks = tasks;

    this.sqsConsumer = new SQSConsumer({
      queueUrl: options.queueUrl,
      sqs: options.sqs,
      handleMessage: this.handleMessage,
      log
    });
  }

  start() {
    log.silly('Starting...');

    return this.sqsConsumer.start();
  }

  stop() {
    log.silly('Stopping...');

    return this.sqsConsumer.stop();
  }

  async handleMessage(message: SQSMessage) {
    const startTime = process.hrtime();

    log.verbose(`Started worker iteration...`);

    let msg: any;

    try {
      msg = JSON.parse(message.Body as string);
    } catch (err) {
      log.error(err);

      throw new Error('Error while parsing JSON');
    }

    let tasks = this.tasks;

    if (msg?.data) {
      let ids: Array<TaskIdEnum>;

      try {
        ids = JSON.parse(msg.data);
      } catch (err) {
        log.error(err);

        throw new Error('Error while parse json. Details :' + err?.message);
      }

      if (Array.isArray(ids)) {
        tasks = this.tasks.filter((task: IWorkerTask) => ids.includes(task.action));
      }
    }

    for (const task of tasks) {
      try {
        await task.exec();
      } catch (err) {
        log.error('Error while executing worker task. Reason :', err.message);
        log.error(err);
      }
    }

    const endTime = process.hrtime(startTime);

    log.verbose(`Finished worker iteration in: ${endTime[0]}s`);

    return true;
  }
}
