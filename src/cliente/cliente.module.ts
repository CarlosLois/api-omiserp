import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { ClienteController } from './cliente.controller';
import { ClienteService } from './cliente.service';
import { CnpjService } from './services/cnpj.service';

@Module({
  imports: [CoreModule],
  controllers: [ClienteController],
  providers: [ClienteService, CnpjService],
})
export class ClienteModule {}
