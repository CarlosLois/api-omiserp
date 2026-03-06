import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CoreService } from '../core/services/core.service';
import { TenantConnectionService } from '../core/services/tenant-connection.service';
import { Usuario } from '../tenant/entities/usuario.entity';
import { getTenantDataSource, getTenantId } from '../tenant/utils/get-datasource';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { DefinirSenhaDto } from './dto/definir-senha.dto';

@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name);

  constructor(
    private readonly coreService: CoreService,
    private readonly tenantConnectionService: TenantConnectionService,
  ) {}

  async criarUsuario(dto: CreateUsuarioDto) {
    const dataSource = getTenantDataSource();
    const tenantId = getTenantId();
    const usuarioRepo = dataSource.getRepository(Usuario);
    const hash = await bcrypt.hash(dto.senha, 10);

    this.logger.log(
      JSON.stringify({
        event: 'usuario_criacao_inicio',
        email: dto.email,
        login: dto.login,
        clienteId: tenantId,
      }),
    );

    const usuario = await usuarioRepo.save({
      usuarioLogin: dto.login,
      usuarioNome: dto.nome,
      usuarioEmail: dto.email,
      usuarioSenha: hash,
      usuarioAtivo: 'S',
    });

    await this.coreService.criarUsuarioRegistro({
      clienteId: tenantId,
      email: dto.email,
    });

    this.logger.log(
      JSON.stringify({
        event: 'usuario_criacao_sucesso',
        usuarioId: usuario.usuarioId,
        email: dto.email,
        clienteId: tenantId,
      }),
    );

    return usuario;
  }

  async definirSenha(dto: DefinirSenhaDto) {
    const email = dto.email.trim();
    const usuarioRegistro = await this.coreService.findUsuarioByEmail(email);

    if (!usuarioRegistro) {
      throw new BadRequestException('Usuario nao encontrado');
    }

    const cliente = usuarioRegistro.cliente;
    const dataSource = await this.tenantConnectionService.getDataSource(cliente);
    const usuarioRepo = dataSource.getRepository(Usuario);

    const usuario = await usuarioRepo
      .createQueryBuilder('u')
      .where('LOWER(u.usuarioEmail) = LOWER(:email)', { email })
      .orWhere('LOWER(u.usuarioLogin) = LOWER(:email)', { email })
      .getOne();

    if (!usuario) {
      throw new BadRequestException('Usuario nao encontrado');
    }

    usuario.usuarioSenha = await bcrypt.hash(dto.senha, 10);
    await usuarioRepo.save(usuario);

    this.logger.log(
      JSON.stringify({
        event: 'usuario_definir_senha_sucesso',
        email,
        clienteId: cliente.clienteRegId,
        usuarioId: usuario.usuarioId,
      }),
    );

    return {
      message: 'Senha definida com sucesso',
    };
  }
}
