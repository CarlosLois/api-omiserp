import { AsyncLocalStorage } from 'node:async_hooks';
import { DataSource } from 'typeorm';

export interface TenantStore {
  clienteId: string;
  dataSource: DataSource;
}

export const tenantContext = new AsyncLocalStorage<TenantStore>();
