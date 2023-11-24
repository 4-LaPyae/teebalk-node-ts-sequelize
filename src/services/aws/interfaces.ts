import * as AWS from 'aws-sdk';

export interface IS3Service {
  createUploadUrl(key: string, isPublic: boolean, expiresIn: number): Promise<string>;

  getHeadObject(key: string): Promise<AWS.S3.HeadObjectOutput>;

  deleteObject(key: string): Promise<any>;

  deleteObjectByUrl(url: string): Promise<any>;
}

export interface ISQSSendMessageParams {
  delay?: number;
  attributes?: any;
}

export interface ISQSSubscription {
  id: string;
  attributes: any;
  handler: any;
}
