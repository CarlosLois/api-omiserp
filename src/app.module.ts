import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { TenantMiddleware } from './tenant/middleware/tenant.middleware';
import { ClienteModule } from './cliente/cliente.module';
import { UsuarioModule } from './usuario/usuario.module';

@Module({
  imports: [CoreModule, AuthModule, ClienteModule, UsuarioModule],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
