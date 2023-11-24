import config from '../config';

const { username, password, name: database, host, port } = config.get('db');

module.exports = {
  development: {
    username,
    password,
    database,
    host,
    port,
    dialect: 'mysql',
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeSeederData'
  },
  test: {
    username,
    password,
    database,
    host,
    port,
    dialect: 'mysql',
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeSeederData'
  },
  production: {
    username,
    password,
    database,
    host,
    port,
    dialect: 'mysql',
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeSeederData'
  }
};
