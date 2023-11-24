import * as uuid from 'uuid/v1';

export const createLogReqPrefix = (text: string) => `reqId:${uuid.default()}: ${text}`;
