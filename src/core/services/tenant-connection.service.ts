import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ClienteRegistro } from '../entities/cliente-registro.entity';
import { Usuario } from 'src/tenant/entities/usuario.entity';

@Injectable()
export class TenantConnectionService {
  private dataSources = new Map<number, DataSource>();

  async getDataSource(cliente: ClienteRegistro): Promise<DataSource> {
    const clientId = Number(cliente.clienteRegId);

    if (this.dataSources.has(clientId)) {
      return this.dataSources.get(clientId)!;
    }

    const dataSource = new DataSource({
      type: 'postgres',
      host: cliente.clienteRegDbHost,
      port: Number(cliente.clienteRegDbPort),
      username: cliente.clienteRegDbUser,
      password: cliente.clienteRegDbPassword,
      database: cliente.clienteRegDbName,
      entities: [Usuario],
      synchronize: false,
    });

    await dataSource.initialize();

    this.dataSources.set(clientId, dataSource);

    return dataSource;
  }
}
