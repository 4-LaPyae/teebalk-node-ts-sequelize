import Logger from '@freewilltokyo/logger';
import { Sequelize } from 'sequelize';

import config from '../config';

const log = new Logger('DB:Provider');

interface SequelizeConfig {
  username: string;
  password: string;
  name: string;
  host: string;
  port: number;
}

const options: SequelizeConfig = config.get('db') as any;

class DbProvider {
  db: Sequelize;

  constructor() {
    this.db = new Sequelize(options.name, options.username, options.password, {
      host: options.host,
      port: +options.port,
      dialect: 'mysql',
      define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      },
      pool: {
        max: 15, // プールするコネクションの最大値
        // idle: 30000, // コネクションがリリースされた後にアイドル状態になるまでの最大時間（ミリ秒、evictと合わせて使う）
        acquire: 60000 // poolがエラーをthrowする前に接続しようとする最大時間（ミリ秒）
        // evict: 10000 // 無効になった接続を呼び出すための時間間隔（ミリ秒）
      },
      dialectOptions: { decimalNumbers: true },
      logging: (msg: string) => log.silly(msg)
    });
  }
}

export const db = new DbProvider().db;
