import { InternalServerErrorException } from '@nestjs/common';
import { tenantContext } from '../context/tenant.context';

export function getTenantStore() {
  const store = tenantContext.getStore();

  if (!store) {
    throw new InternalServerErrorException('Tenant nao identificado');
  }

  return store;
}

export function getTenantDataSource() {
  return getTenantStore().dataSource;
}

export function getTenantId() {
  return getTenantStore().clienteId;
}
