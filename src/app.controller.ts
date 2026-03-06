import { Controller, Get, Query } from '@nestjs/common';
import { CoreService } from './core/services/core.service';

@Controller()
export class AppController {
  constructor(private readonly coreService: CoreService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'api-gestao',
      timestamp: new Date(),
    };
  }
}
