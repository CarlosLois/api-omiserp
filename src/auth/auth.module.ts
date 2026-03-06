import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CoreModule } from '../core/core.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    CoreModule,
    PassportModule,
    JwtModule.register({
      secret: 'segredo-super-forte',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
