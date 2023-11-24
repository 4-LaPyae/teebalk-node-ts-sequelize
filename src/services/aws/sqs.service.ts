import Logger from '@freewilltokyo/logger';
import * as SQS from 'aws-sdk/clients/sqs';
import { Consumer } from 'sqs-consumer';
import * as uuid from 'uuid/v1';

import { ISQSSendMessageParams, ISQSSubscription } from './interfaces';

const log = new Logger('SRV:AWS:SQSService');

export type SQSMessage = SQS.Types.Message;

export interface ISQSService {
  send(msg: string, params?: ISQSSendMessageParams): Promise<any>;

  subscribe(handler: any, attributes?: any): string;

  unsubscribe(subscriptionId: any): void;
}

export class SQSService implements ISQSService {
  private queueUrl: string;
  private sqs: SQS;
  private consumer: any;
  private subscriptions: ISQSSubscription[];

  constructor(sqsInstance: SQS, queueUrl: string) {
    if (!sqsInstance) {
      throw new Error('Parameter "sqsInstance" is required');
    }

    if (!queueUrl) {
      throw new Error('Endpoint parameter is required');
    }

    this.sqs = sqsInstance;
    this.queueUrl = queueUrl;
    this.subscriptions = [];

    // TODO implement local consumer with using own AbstractPolling class
    this.consumer = Consumer.create({
      queueUrl,
      handleMessage: this._handleMessage.bind(this),
      sqs: this.sqs
    });

    this.consumer.on('error', (err: Error) => {
      log.error('SQS Consumer error', err);
    });
    this.consumer.on('processing_error', (err: Error) => {
      log.error('SQS Consumer processing_error', err);
    });
    this.consumer.on('timeout_error', (err: Error) => {
      log.error('SQS Consumer timeout_error', err);
    });
  }

  // subscribe to new messages
  subscribe(handler: any, attributes: any = {}) {
    log.info('Received new subscription handler with attributes', attributes);

    if (!handler || typeof handler !== 'function') {
      log.error('Listener is not a function');

      throw new Error('Listener should be a function');
    }

    const id = uuid.default();

    this.subscriptions.push({ id, handler, attributes });

    if (!this.consumer.isRunning) {
      log.info('Starting consumer...');
      this.consumer.start();
    }

    return id;
  }

  unsubscribe(subscriptionId: string) {
    this.subscriptions = this.subscriptions.filter((subscription: ISQSSubscription) => subscription.id !== subscriptionId);
  }

  // publish new message
  send(msg: string, options: ISQSSendMessageParams = {}) {
    log.info('Sending message', msg, options);

    return new Promise((resolve, reject) => {
      // TODO try to use .promise at the end
      this.sqs.sendMessage(
        {
          MessageBody: msg,
          QueueUrl: this.queueUrl,
          DelaySeconds: options.delay || 0,
          MessageAttributes: options.attributes || {}
        },
        (err: Error, data: any) => {
          if (err) {
            log.error('Error sending message', msg, err);

            return reject(err);
          }
          log.info('Message has been sent', data);

          return resolve(data);
        }
      );
    });
  }

  private _deleteMessage(message: SQSMessage) {
    return new Promise((res, rej) => {
      const params = {
        QueueUrl: this.queueUrl,
        ReceiptHandle: message.ReceiptHandle + ''
      };

      this.sqs.deleteMessage(params, (err: Error, data: any) => {
        if (err) {
          log.error('Error while deleting message. Reason:', err);

          return rej(err);
        }
        log.info(`Message ${message.MessageId} has been removed from queue successfully.`, data);

        return res(data);
      });
    });
  }

  private async _handleMessage(message: SQSMessage): Promise<void> {
    log.silly('received message', message);

    if (!this.subscriptions.length) {
      log.error('Received message', message, 'but no any subscriptions');

      throw new Error('No handlers for received message');
    }

    await Promise.all(
      this.subscriptions.map(async (subscription: ISQSSubscription) => {
        try {
          await subscription.handler(message);
        } catch (err) {
          log.error('Error while handling SQS message. Reason:', err);
        }
      })
    );

    await this._deleteMessage(message);
  }
}
