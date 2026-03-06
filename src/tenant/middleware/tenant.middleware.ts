import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { CoreService } from '../../core/services/core.service';
import { TenantConnectionService } from '../../core/services/tenant-connection.service';
import { tenantContext } from '../context/tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  constructor(
    private readonly coreService: CoreService,
    private readonly tenantConnectionService: TenantConnectionService,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    try {
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : undefined;

      if (!token) {
        next();
        return;
      }

      const payload = await this.jwtService.verifyAsync<{
        tenantId?: string | number;
      }>(token, { secret: 'segredo-super-forte' });

      if (!payload.tenantId) {
        next();
        return;
      }

      const cliente = await this.coreService.findClienteById(payload.tenantId);

      if (!cliente) {
        next();
        return;
      }

      const dataSource = await this.tenantConnectionService.getDataSource(cliente);

      tenantContext.run(
        {
          clienteId: cliente.clienteRegId,
          dataSource,
        },
        () => next(),
      );
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          event: 'tenant_middleware_token_invalido',
          path: req.url,
        }),
      );
      next();
    }
  }
}
