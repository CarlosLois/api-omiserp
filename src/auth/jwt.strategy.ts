import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

const JWT_SECRET = process.env.JWT_SECRET ?? 'insecure-dev-secret';

interface JwtPayload {
  sub: number;
  tenantId: number;
  cnpj: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
