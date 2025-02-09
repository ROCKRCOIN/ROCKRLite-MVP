module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: 'rockrlite_dev',
      user: 'postgres',
      password: 'postgres'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  },
  // Tables for mock blockchain data
  tables: {
    accounts: 'rks_accounts',
    transactions: 'rks_transactions',
    mining_tasks: 'rks_mining_tasks',
    experiences: 'experiences',
    domains: 'domains',
    users: 'users'
  }
}
