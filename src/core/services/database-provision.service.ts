import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';

@Injectable()
export class DatabaseProvisionService {
  private escapeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  async criarBanco(nomeBanco: string) {
    const adminDataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_OFICIAL_HOST,
      port: Number(process.env.DB_OFICIAL_PORT),
      username: process.env.DB_OFICIAL_USER,
      password: process.env.DB_OFICIAL_PASS,
      database: 'postgres',
    });

    await adminDataSource.initialize();

    try {
      const dbExists: unknown[] = await adminDataSource.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [nomeBanco],
      );

      if (dbExists.length > 0) {
        return;
      }

      await adminDataSource
        .query(`CREATE DATABASE ${this.escapeIdentifier(nomeBanco)}`)
        .catch(() => {});
    } finally {
      await adminDataSource.destroy();
    }
  }

  async executarSchema(nomeBanco: string) {
    const schemaPath = path.resolve(process.cwd(), 'database', 'schema.sql');
    const schemaSql = await readFile(schemaPath, 'utf8');

    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_OFICIAL_HOST,
      port: Number(process.env.DB_OFICIAL_PORT),
      username: process.env.DB_OFICIAL_USER,
      password: process.env.DB_OFICIAL_PASS,
      database: nomeBanco,
    });

    await dataSource.initialize();

    try {
      await dataSource.query(schemaSql);
    } finally {
      await dataSource.destroy();
    }
  }

  async removerBanco(nomeBanco: string) {
    const adminDataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_OFICIAL_HOST,
      port: Number(process.env.DB_OFICIAL_PORT),
      username: process.env.DB_OFICIAL_USER,
      password: process.env.DB_OFICIAL_PASS,
      database: 'postgres',
    });

    await adminDataSource.initialize();

    try {
      await adminDataSource.query(
        `
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = $1
          AND pid <> pg_backend_pid()
        `,
        [nomeBanco],
      );

      await adminDataSource.query(
        `DROP DATABASE IF EXISTS ${this.escapeIdentifier(nomeBanco)}`,
      );
    } finally {
      await adminDataSource.destroy();
    }
  }
}
