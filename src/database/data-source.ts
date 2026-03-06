import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_OFICIAL_HOST,
  port: Number(process.env.DB_OFICIAL_PORT),
  username: process.env.DB_OFICIAL_USER,
  password: process.env.DB_OFICIAL_PASS,
  database: 'postgres',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
