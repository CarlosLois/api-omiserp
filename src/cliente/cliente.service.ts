import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CoreService } from '../core/services/core.service';
import { TenantConnectionService } from '../core/services/tenant-connection.service';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../tenant/entities/usuario.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { DatabaseProvisionService } from '../core/services/database-provision.service';
import { DataSource, QueryRunner } from 'typeorm';
import { criarMensagem } from '../common/messages/message.types';

type IdRow<Key extends string> = Record<Key, number>;

@Injectable()
export class ClienteService {
  private readonly logger = new Logger(ClienteService.name);

  constructor(
    private readonly coreService: CoreService,
    private readonly tenantConnectionService: TenantConnectionService,
    private readonly dbProvision: DatabaseProvisionService,
  ) {}

  private gerarNomeBanco(nomeFantasia: string): string {
    const normalizado = nomeFantasia
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();

    return `DM_${normalizado}`;
  }

  private normalizarTexto(valor?: string | null): string | null {
    if (!valor) {
      return null;
    }

    return valor.trim().replace(/\s+/g, ' ').toUpperCase();
  }

  private normalizarEmail(valor?: string | null): string | null {
    if (!valor) {
      return null;
    }
    return valor.trim().toLowerCase();
  }

  private formatarCnpjCpf(valor?: string | null): string {
    const digits = String(valor ?? '')
      .replace(/\D/g, '')
      .slice(0, 14);

    if (digits.length <= 11) {
      return digits
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2');
    }

    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  private formatarCep(valor?: string | null): string | null {
    if (!valor) {
      return null;
    }

    const digits = String(valor).replace(/\D/g, '').slice(0, 8);

    if (!digits) {
      return null;
    }

    if (digits.length <= 5) {
      return digits;
    }

    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  private normalizarPayload(dto: CreateClienteDto) {
    return {
      razao: this.normalizarTexto(dto.razao) ?? '',
      nomeFantasia: this.normalizarTexto(dto.nomeFantasia) ?? '',
      cnpj: this.formatarCnpjCpf(dto.cnpj),
      adminNome: this.normalizarTexto(dto.adminNome) ?? '',
      adminLogin: this.normalizarEmail(dto.adminLogin) ?? '',
      adminEmail: this.normalizarEmail(dto.adminEmail) ?? '',
      adminSenha: dto.adminSenha?.trim() || undefined,
      endereco: {
        cidade: this.normalizarTexto(dto.endereco?.cidade) ?? '',
        bairro: this.normalizarTexto(dto.endereco?.bairro) ?? '',
        cep: this.formatarCep(dto.endereco?.cep),
        tipoLogradouro: this.normalizarTexto(
          dto.endereco?.tipoLogradouro ?? dto.endereco?.pessoa_tipologradouro,
        ),
        logradouro: this.normalizarTexto(dto.endereco?.logradouro) ?? '',
        numero: this.normalizarTexto(dto.endereco?.numero),
        complemento: this.normalizarTexto(dto.endereco?.complemento),
        uf: this.normalizarTexto(dto.endereco?.uf) ?? '',
        estadoCodigo: this.normalizarTexto(dto.endereco?.estadoCodigo),
      },
      contato: dto.contato
        ? {
            nome: this.normalizarTexto(dto.contato.nome),
            email: this.normalizarEmail(dto.contato.email),
            telefone: this.normalizarTexto(dto.contato.telefone),
            celular: this.normalizarTexto(dto.contato.celular),
          }
        : undefined,
    };
  }

  private async queryRows<T>(
    queryRunner: QueryRunner,
    sql: string,
    params: unknown[],
  ): Promise<T[]> {
    return (await queryRunner.query(sql, params)) as T[];
  }

  private async obterDataSourceBancoOficial(): Promise<DataSource> {
    const database = process.env.DB_OFICIAL_NAME;

    if (!database) {
      throw new InternalServerErrorException('DB_OFICIAL_NAME nao configurado');
    }

    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_OFICIAL_HOST,
      port: Number(process.env.DB_OFICIAL_PORT),
      username: process.env.DB_OFICIAL_USER,
      password: process.env.DB_OFICIAL_PASS,
      database,
    });

    await dataSource.initialize();
    return dataSource;
  }

  private async obterOuCriarCidade(
    queryRunner: QueryRunner,
    descricao: string,
  ): Promise<number> {
    const cidadeExistente = await this.queryRows<IdRow<'cidade_id'>>(
      queryRunner,
      `
      SELECT cidade_id
      FROM cidade
      WHERE LOWER(cidade_descricao) = LOWER($1)
      ORDER BY cidade_id ASC
      LIMIT 1
      `,
      [descricao],
    );

    if (cidadeExistente.length > 0) {
      return cidadeExistente[0].cidade_id;
    }

    const cidadeCriada = await this.queryRows<IdRow<'cidade_id'>>(
      queryRunner,
      `
      INSERT INTO cidade (cidade_descricao)
      VALUES ($1)
      RETURNING cidade_id
      `,
      [descricao],
    );

    return cidadeCriada[0].cidade_id;
  }

  private async obterOuCriarBairro(
    queryRunner: QueryRunner,
    descricao: string,
  ): Promise<number> {
    const bairroExistente = await this.queryRows<IdRow<'bairro_id'>>(
      queryRunner,
      `
      SELECT bairro_id
      FROM bairro
      WHERE LOWER(bairro_descricao) = LOWER($1)
      ORDER BY bairro_id ASC
      LIMIT 1
      `,
      [descricao],
    );

    if (bairroExistente.length > 0) {
      return bairroExistente[0].bairro_id;
    }

    const bairroCriado = await this.queryRows<IdRow<'bairro_id'>>(
      queryRunner,
      `
      INSERT INTO bairro (bairro_descricao)
      VALUES ($1)
      RETURNING bairro_id
      `,
      [descricao],
    );

    return bairroCriado[0].bairro_id;
  }

  private async criarPessoaInicial(
    queryRunner: QueryRunner,
    dto: ReturnType<ClienteService['normalizarPayload']>,
    clienteRegistroId: string,
  ): Promise<number> {
    const contato = dto.contato;
    const pessoaInserida = await this.queryRows<IdRow<'pessoa_id'>>(
      queryRunner,
      `
      INSERT INTO pessoa (
        pessoa_tipo,
        pessoa_cnpjcpf,
        pessoa_razao,
        pessoa_fantasia,
        pessoa_cliente,
        pessoa_email,
        pessoa_telefone,
        pessoa_celular,
        pessoa_clientregid
      ) VALUES (
        'J',
        $1,
        $2,
        $3,
        'S',
        $4,
        $5,
        $6,
        $7
      )
      RETURNING pessoa_id
      `,
      [
        dto.cnpj,
        dto.razao,
        dto.nomeFantasia,
        dto.adminEmail,
        contato?.telefone ?? null,
        contato?.celular ?? null,
        Number(clienteRegistroId),
      ],
    );

    return pessoaInserida[0].pessoa_id;
  }

  private async criarEnderecoInicial(
    queryRunner: QueryRunner,
    pessoaId: number,
    dto: ReturnType<ClienteService['normalizarPayload']>,
  ): Promise<void> {
    const endereco = dto.endereco;
    const cidade = endereco?.cidade;
    const bairro = endereco?.bairro;
    const logradouro = endereco?.logradouro;
    const uf = endereco?.uf;

    if (!cidade || !bairro || !logradouro || !uf) {
      throw new BadRequestException(
        'Endereco incompleto: cidade, bairro, logradouro e uf sao obrigatorios',
      );
    }

    const cidadeId = await this.obterOuCriarCidade(queryRunner, cidade);
    const bairroId = await this.obterOuCriarBairro(queryRunner, bairro);
    const estadoCodigo = (endereco?.estadoCodigo ?? uf).toUpperCase();
    const estadoValido = await this.queryRows<unknown>(
      queryRunner,
      `
      SELECT 1
      FROM estado
      WHERE estado_codigo = $1
      LIMIT 1
      `,
      [estadoCodigo],
    );

    if (estadoValido.length === 0) {
      throw new BadRequestException('UF/estado invalido para endereco');
    }

    await queryRunner.query(
      `
      INSERT INTO endereco (
        endereco_pessoaid,
        endereco_cep,
        endereco_tipologradouro,
        endereco_logradouro,
        endereco_numero,
        endereco_complemento,
        endereco_bairroid,
        endereco_cidadeid,
        endereco_uf,
        endereco_estadocodigo
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
      `,
      [
        pessoaId,
        endereco?.cep ?? null,
        endereco?.tipoLogradouro ?? null,
        logradouro,
        endereco?.numero ?? null,
        endereco?.complemento ?? null,
        bairroId,
        cidadeId,
        uf.toUpperCase(),
        estadoCodigo,
      ],
    );
  }

  private async criarContatoInicial(
    queryRunner: QueryRunner,
    pessoaId: number,
    dto: ReturnType<ClienteService['normalizarPayload']>,
  ): Promise<void> {
    const contato = dto.contato;
    await queryRunner.query(
      `
      INSERT INTO contato (
        contato_pessoaid,
        contato_nome,
        contato_email,
        contato_telefone,
        contato_celular
      ) VALUES (
        $1, $2, $3, $4, $5
      )
      `,
      [
        pessoaId,
        contato?.nome ?? dto.adminNome,
        contato?.email ?? dto.adminEmail,
        contato?.telefone ?? null,
        contato?.celular ?? null,
      ],
    );
  }

  private async inserirDadosClienteNoBanco(
    dataSource: DataSource,
    dto: ReturnType<ClienteService['normalizarPayload']>,
    clienteRegistroId: string,
    incluirUsuario: boolean,
    hashSenha?: string,
  ): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (incluirUsuario) {
        const usuarioRepo = queryRunner.manager.getRepository(Usuario);

        await usuarioRepo.save({
          usuarioLogin: dto.adminLogin,
          usuarioNome: dto.adminNome,
          usuarioEmail: dto.adminEmail,
          usuarioSenha: hashSenha ?? '',
          usuarioAtivo: 'S',
        });
      }

      const pessoaId = await this.criarPessoaInicial(
        queryRunner,
        dto,
        clienteRegistroId,
      );

      await this.criarEnderecoInicial(queryRunner, pessoaId, dto);
      await this.criarContatoInicial(queryRunner, pessoaId, dto);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async registrarCliente(dto: CreateClienteDto) {
    const dados = this.normalizarPayload(dto);

    this.logger.log(
      JSON.stringify({
        event: 'cliente_registro_inicio',
        cnpj: dados.cnpj,
        adminEmail: dados.adminEmail,
      }),
    );

    const dbname = this.gerarNomeBanco(dados.nomeFantasia);
    const exists = await this.coreService.findClienteByDbName(dbname);

    if (exists) {
      throw new BadRequestException('Nome fantasia ja utilizado');
    }

    const cliente = await this.coreService.registrarClienteCentral({
      razao: dados.razao,
      nomeFantasia: dados.nomeFantasia,
      cnpj: dados.cnpj,
      dbhost: process.env.DB_OFICIAL_HOST ?? '',
      dbport: Number(process.env.DB_OFICIAL_PORT),
      dbname,
      dbuser: process.env.DB_OFICIAL_USER ?? '',
      dbpassword: process.env.DB_OFICIAL_PASS ?? '',
      adminEmail: dados.adminEmail,
    });

    const hash = dados.adminSenha
      ? await bcrypt.hash(dados.adminSenha, 10)
      : '';
    const bancoOficial = process.env.DB_OFICIAL_NAME;

    if (!bancoOficial) {
      throw new InternalServerErrorException('DB_OFICIAL_NAME nao configurado');
    }

    try {
      await this.dbProvision.criarBanco(dbname);
      await this.dbProvision.executarSchema(dbname);
      await this.dbProvision.executarSchema(bancoOficial);

      const dataSource =
        await this.tenantConnectionService.getDataSource(cliente);

      await this.inserirDadosClienteNoBanco(
        dataSource,
        dados,
        cliente.clienteRegId,
        true,
        hash,
      );

      const oficialDataSource = await this.obterDataSourceBancoOficial();

      try {
        await this.inserirDadosClienteNoBanco(
          oficialDataSource,
          dados,
          cliente.clienteRegId,
          false,
        );
      } finally {
        await oficialDataSource.destroy();
      }

      this.logger.log(
        JSON.stringify({
          event: 'cliente_registro_sucesso',
          clienteId: cliente.clienteRegId,
          adminEmail: dados.adminEmail,
        }),
      );
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          event: 'cliente_registro_falha_tenant',
          clienteId: cliente.clienteRegId,
          adminEmail: dados.adminEmail,
        }),
        error instanceof Error ? error.stack : undefined,
      );

      await Promise.allSettled([
        this.coreService.removerCliente(cliente.clienteRegId),
        this.dbProvision.removerBanco(dbname),
      ]);
      throw new InternalServerErrorException(
        'Falha ao criar usuario no banco do cliente',
      );
    }

    return {
      message: 'Cliente registrado com sucesso',
      mensagens: [
        criarMensagem('Registro gravado com sucesso.', '', 'CLI_REG_OK'),
      ],
    };
  }
}
