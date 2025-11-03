import { DataSource } from 'typeorm';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { serverConfig } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const AppDataSource = new DataSource({
  type: 'postgres',
  host: serverConfig.DB_HOST,
  port: serverConfig.DB_PORT,
  username: serverConfig.DB_USER,
  password: serverConfig.DB_PASS,
  database: serverConfig.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [join(__dirname, '../entities/*.js')],
  migrations: [join(__dirname, '../migrations/*.js')],
});

export default AppDataSource;