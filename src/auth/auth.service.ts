import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CoreService } from '../core/services/core.service';
import { TenantConnectionService } from '../core/services/tenant-connection.service';
import { Usuario } from '../tenant/entities/usuario.entity';
import { criarMensagem } from '../common/messages/message.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly coreService: CoreService,
    private readonly tenantConnectionService: TenantConnectionService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, senha: string) {
    const credencial = email.trim();

    this.logger.log(
      JSON.stringify({
        event: 'login_tentativa',
        email: credencial,
      }),
    );

    const usuarioRegistro =
      await this.coreService.findUsuarioByEmail(credencial);

    if (!usuarioRegistro) {
      this.logger.warn(
        JSON.stringify({
          event: 'login_falha_usuario_registro',
          email: credencial,
        }),
      );
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const cliente = usuarioRegistro.cliente;

    if (cliente.clienteRegAtivo !== 'S') {
      this.logger.warn(
        JSON.stringify({
          event: 'login_falha_cliente_inativo',
          email: credencial,
          clienteId: cliente.clienteRegId,
        }),
      );
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const dataSource =
      await this.tenantConnectionService.getDataSource(cliente);
    const usuarioRepo = dataSource.getRepository(Usuario);

    const usuario = await usuarioRepo
      .createQueryBuilder('u')
      .where('LOWER(u.usuarioLogin) = LOWER(:credencial)', { credencial })
      .orWhere('LOWER(u.usuarioEmail) = LOWER(:credencial)', { credencial })
      .getOne();

    if (!usuario) {
      this.logger.warn(
        JSON.stringify({
          event: 'login_falha_usuario_tenant',
          email: credencial,
          clienteId: cliente.clienteRegId,
        }),
      );
      throw new UnauthorizedException('Credenciais invalidas');
    }

    if (!usuario.usuarioSenha || usuario.usuarioSenha.trim() === '') {
      this.logger.warn(
        JSON.stringify({
          event: 'login_set_password_required',
          email: credencial,
          clienteId: cliente.clienteRegId,
        }),
      );

      return {
        status: 'SET_PASSWORD_REQUIRED',
        mensagens: [
          criarMensagem(
            'Definicao de senha obrigatoria no primeiro acesso.',
            'Informe e confirme uma nova senha para continuar.',
            'AUTH_SET_PASSWORD_REQUIRED',
          ),
        ],
      };
    }

    const senhaInformada = senha.trim();

    if (senhaInformada.length < 6) {
      throw new BadRequestException({
        mensagens: [
          criarMensagem(
            'A senha deve ter no minimo 6 caracteres.',
            'Informe a senha cadastrada para este usuario.',
            'AUTH_PASSWORD_MIN_LENGTH',
          ),
        ],
      });
    }

    const senhaValida = await bcrypt.compare(
      senhaInformada,
      usuario.usuarioSenha,
    );

    if (!senhaValida) {
      this.logger.warn(
        JSON.stringify({
          event: 'login_falha_senha',
          email: credencial,
          clienteId: cliente.clienteRegId,
        }),
      );
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const payload = {
      sub: usuario.usuarioId,
      tenantId: cliente.clienteRegId,
      cnpj: cliente.clienteRegCnpj,
      email: usuario.usuarioEmail,
    };

    const token = await this.jwtService.signAsync(payload);

    this.logger.log(
      JSON.stringify({
        event: 'login_sucesso',
        email: credencial,
        usuarioId: usuario.usuarioId,
        clienteId: cliente.clienteRegId,
      }),
    );

    return {
      access_token: token,
      usuario: usuario.usuarioNome,
      empresa: cliente.clienteRegRazao,
      mensagens: [
        criarMensagem('Login realizado com sucesso.', '', 'AUTH_LOGIN_SUCCESS'),
      ],
    };
  }
}
