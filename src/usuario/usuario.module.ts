import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';

@Module({
  imports: [CoreModule],
  providers: [UsuarioService],
  controllers: [UsuarioController],
})
export class UsuarioModule {}
