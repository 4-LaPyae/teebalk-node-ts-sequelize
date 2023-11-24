import fs from 'fs';
import path from 'path';

import Logger from '@freewilltokyo/logger';
import convict from 'convict';
import dotenv from 'dotenv';

dotenv.config();

const log = new Logger('Config');

const config = convict({
  env: {
    doc: 'Execution environment',
    format: ['production', 'development', 'test'],
    default: 'development',
    arg: 'nodeEnv',
    env: 'NODE_ENV'
  },
  host: {
    doc: 'The IP address to bind',
    format: 'ipaddress',
    default: '0.0.0.0',
    arg: 'ipAdress',
    env: 'HOST'
  },
  port: {
    doc: 'The PORT to bind',
    format: 'port',
    default: 3000,
    arg: 'port',
    env: 'PORT'
  },

  version: {
    doc: 'Package version',
    format: String,
    default: '0.0.0',
    arg: 'version',
    env: 'VERSION'
  },

  frontendUrl: {
    doc: 'Frontend url',
    format: String,
    default: 'http://localhost:4200',
    arg: 'frontendUrl',
    env: 'FRONTEND_URL'
  },

  assetsUrl: {
    doc: 'assets url',
    format: String,
    default: 'https://assets.tells-market.com',
    arg: 'assetsUrl',
    env: 'ASSETS_URL'
  },

  orderEmail: {
    doc: 'order sender email',
    format: String,
    default: 'info@tells-market.com',
    arg: 'orderEmail',
    env: 'ORDER_EMAIL'
  },

  adminEmail: {
    doc: 'admin email',
    format: String,
    default: 'info@tells-market.com',
    arg: 'adminEmail',
    env: 'ADMIN_EMAIL'
  },

  aws: {
    accessKeyId: {
      doc: 'The AWS_ACCESS_KEY address to bind',
      format: String,
      default: null,
      arg: 'awsKeyId',
      env: 'AWS_ACCESS_KEY'
    },
    secretAccessKey: {
      doc: 'The AWS_SECRET_KEY address to bind',
      format: String,
      default: null,
      arg: 'awsSecretKey',
      env: 'AWS_SECRET_KEY'
    },
    region: {
      doc: 'The AWS_REGION address to bind',
      format: String,
      default: null,
      arg: 'awsRegion',
      env: 'AWS_REGION'
    },
    s3: {
      bucket: {
        doc: 'The AWS_REGION address to bind',
        format: String,
        default: null,
        arg: 'awsS3Bucket',
        env: 'AWS_S3_BUCKET'
      }
    },
    sqs: {
      doc: 'The AWS_REGION address to bind',
      format: String,
      default: null,
      arg: 'awsSQSQueueUrl',
      env: 'AWS_SQS_WORKER_URL'
    }
  },

  db: {
    username: {
      format: String,
      default: null,
      arg: 'dbUsername',
      env: 'DB_USERNAME'
    },
    password: {
      format: String,
      sensitive: true,
      default: null,
      arg: 'dbPassword',
      env: 'DB_PASSWORD'
    },
    host: {
      format: String,
      default: 'localhost',
      arg: 'dbHost',
      env: 'DB_HOST'
    },
    port: {
      format: String,
      default: '3306',
      arg: 'dbPort',
      env: 'DB_PORT'
    },
    name: {
      format: String,
      default: null,
      arg: 'dbName',
      env: 'DB_NAME'
    }
  },

  srv: {
    email: {
      doc: 'The EMAIL_SERVICE_SRV_RECORD address to bind',
      format: String,
      default: 'localhost:8004',
      arg: 'emailServiceSrv',
      env: 'EMAIL_SERVICE_SRV_RECORD'
    },
    payment: {
      doc: 'The PAYMENT_SERVICE_SRV_RECORD address to bind',
      format: String,
      default: 'localhost:8001',
      arg: 'paymentServiceSrv',
      env: 'PAYMENT_SERVICE_SRV_RECORD'
    }
  },

  sso: {
    apiUrl: {
      format: String,
      default: 'http://localhost:3001/api',
      arg: 'ssoApiUrl',
      env: 'SSO_SERVICE_API_URL'
    }
  },

  spin: {
    apiUrl: {
      format: String,
      default: 'http://localhost:3000/api',
      arg: 'spinApiUrl',
      env: 'SPIN_SERVICE_API_URL'
    }
  },

  vibes: {
    apiUrl: {
      format: String,
      default: 'http://localhost:3031/api',
      arg: 'vibesApiUrl',
      env: 'VIBES_SERVICE_API_URL'
    }
  },

  stripe: {
    secretKey: {
      format: String,
      default: '',
      arg: 'stripeSecretKey',
      env: 'STRIPE_SECRET_KEY'
    },
    publicKey: {
      format: String,
      default: '',
      arg: 'stripePublicKey',
      env: 'STRIPE_PUBLIC_KEY'
    },
    webhookSecretKey: {
      format: String,
      default: '',
      arg: 'stripeWebhookSecretKey',
      env: 'STRIPE_WEBHOOK_SECRET_KEY'
    },
    webhookConnectSecretKey: {
      format: String,
      default: '',
      arg: 'stripeWebhookConnectSecretKey',
      env: 'STRIPE_CONNECT_WEBHOOK_SECRET_KEY'
    },
    purchaseConnectedAccount: {
      format: String,
      default: '',
      arg: 'stripePurchaseConnectedAccount',
      env: 'STRIPE_PURCHASE_CONNECTED_ACCOUNT'
    }
  },
  exchangeRate: {
    apiUrl: {
      format: String,
      default: '',
      arg: 'exchangeRateApiUrl',
      env: 'EXCHANGE_RATE_API_URL'
    },
    apiKey: {
      format: String,
      default: 'exchangeRateApiKey',
      env: 'EXCHANGE_RATE_API_KEY'
    }
  },
  puppeteer: {
    executablePath: {
      format: String,
      default: '',
      env: 'PUPPETEER_EXECUTABLE_PATH'
    }
  }
});

const env = config.get('env');
const configFile = path.resolve(__dirname, `./env/${env}.json`);
// eslint-disable-next-line @typescript-eslint/tslint/config
if (fs.existsSync(configFile)) {
  config.loadFile(configFile);
}

// throws error if config does not conform to schema
try {
  config.validate({ allowed: 'strict' });
} catch (err) {
  log.error('сonfiguration failed', err);
  process.exit(1);
}

export default config;
