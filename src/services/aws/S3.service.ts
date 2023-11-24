import Logger from '@freewilltokyo/logger';
import * as AWS from 'aws-sdk';
import { PutObjectRequest } from 'aws-sdk/clients/s3';

import { URL_HOST_REGEX } from '../../constants';
import { LogMethodSignature } from '../../logger';

import { IS3Service } from './interfaces';

const log = new Logger('SRV:S3Service');
export class S3Service implements IS3Service {
  private readonly s3: AWS.S3;
  private readonly bucket: string;

  constructor(s3Instance: AWS.S3, bucket: string) {
    this.s3 = s3Instance;
    this.bucket = bucket;
  }

  /**
   * Creates pre-signed url to upload file to S3
   *
   * @param key - uniq key
   * @param expiresIn - seconds
   * @param isPublic - is file with public access
   */
  @LogMethodSignature(log)
  async createUploadUrl(key: string, isPublic = false, expiresIn = 600): Promise<string> {
    try {
      const result = await this.s3.getSignedUrlPromise('putObject', {
        Bucket: this.bucket,
        Key: key,
        Expires: expiresIn, // defaults is 900 seconds
        ACL: isPublic ? 'public-read' : 'private'
      });

      return result;
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  @LogMethodSignature(log)
  async createDownloadUrl(key: string, expiresIn = 10): Promise<string> {
    try {
      const result = await this.s3.getSignedUrlPromise('getObject', {
        Bucket: this.bucket,
        Key: key,
        Expires: expiresIn // defaults is 900 seconds
      });

      return result;
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  @LogMethodSignature(log)
  async getHeadObject(key: string): Promise<AWS.S3.HeadObjectOutput> {
    try {
      const result = await this.s3.headObject({ Bucket: this.bucket, Key: key }).promise();
      return result;
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  @LogMethodSignature(log)
  async deleteObjectByUrl(url: string) {
    try {
      const key = url.replace(URL_HOST_REGEX, '');

      const result = await this.deleteObject(key);
      return result;
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  @LogMethodSignature(log)
  async deleteObject(key: string) {
    try {
      const result = await this.s3.deleteObject({ Bucket: this.bucket, Key: key }).promise();
      return result;
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  @LogMethodSignature(log)
  async uploadFile(Key: string, Body: any, ContentType: string, ContentEncoding: string) {
    try {
      const s3Params = { Body, ContentType, Key, Bucket: this.bucket, ContentEncoding } as PutObjectRequest;

      const result = await this.s3.upload(s3Params).promise();
      return result;
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }
}
