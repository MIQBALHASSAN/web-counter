let knex = require('knex');

const config = {
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'testing',
  },
  migrations: {
    directory: './migrations',
  },
  seeds: {
    directory: './seeders',
  },
};
const Knex = knex(config);

module.exports = Knex;
