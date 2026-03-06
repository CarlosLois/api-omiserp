import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteRegistro } from './entities/cliente-registro.entity';
import * as dotenv from 'dotenv';
import { UsuarioRegistro } from './entities/usuario-registro.entity';
import { CoreService } from './services/core.service';
import { TenantConnectionService } from './services/tenant-connection.service';
import { DatabaseProvisionService } from './services/database-provision.service';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      name: 'core',
      type: 'postgres',
      host: process.env.DB_REGISTRO_HOST,
      port: Number(process.env.DB_REGISTRO_PORT),
      username: process.env.DB_REGISTRO_USER,
      password: process.env.DB_REGISTRO_PASS,
      database: process.env.DB_REGISTRO_NAME,
      entities: [ClienteRegistro, UsuarioRegistro],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([ClienteRegistro, UsuarioRegistro], 'core'),
  ],
  providers: [CoreService, TenantConnectionService, DatabaseProvisionService],
  exports: [CoreService, TenantConnectionService, DatabaseProvisionService],
})
export class CoreModule {}
