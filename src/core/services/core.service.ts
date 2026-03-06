import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UsuarioRegistro } from '../entities/usuario-registro.entity';
import { ClienteRegistro } from '../entities/cliente-registro.entity';

type CriarClienteRegistroInput = {
  razao: string;
  nomeFantasia: string;
  cnpj: string;
  dbhost: string;
  dbport: number;
  dbname: string;
  dbuser: string;
  dbpassword: string;
};

type CriarUsuarioRegistroInput = {
  clienteId: string | number;
  email: string;
};

@Injectable()
export class CoreService {
  constructor(
    @InjectDataSource('core')
    private readonly coreDataSource: DataSource,

    @InjectRepository(UsuarioRegistro, 'core')
    private readonly usuarioRepo: Repository<UsuarioRegistro>,

    @InjectRepository(ClienteRegistro, 'core')
    private readonly clienteRepo: Repository<ClienteRegistro>,
  ) {}

  async findUsuarioByEmail(email: string) {
    return this.usuarioRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.cliente', 'c')
      .where('LOWER(u.usuarioRegEmail) = LOWER(:email)', { email })
      .getOne();
  }

  async findClienteById(id: number | string) {
    return this.clienteRepo.findOne({
      where: { clienteRegId: id.toString() },
    });
  }

  async findClienteByDbName(dbname: string) {
    return this.clienteRepo.findOne({
      where: { clienteRegDbName: dbname },
    });
  }

  async registrarClienteCentral(
    data: CriarClienteRegistroInput & { adminEmail: string },
  ) {
    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cliente = queryRunner.manager.create(ClienteRegistro, {
        clienteRegRazao: data.razao,
        clienteRegNomeFantasia: data.nomeFantasia,
        clienteRegCnpj: data.cnpj,
        clienteRegAtivo: 'S',
        clienteRegDbHost: data.dbhost,
        clienteRegDbPort: data.dbport,
        clienteRegDbName: data.dbname,
        clienteRegDbUser: data.dbuser,
        clienteRegDbPassword: data.dbpassword,
      });

      const clienteSalvo = await queryRunner.manager.save(cliente);

      const usuario = queryRunner.manager.create(UsuarioRegistro, {
        cliente: { clienteRegId: clienteSalvo.clienteRegId } as ClienteRegistro,
        usuarioRegEmail: data.adminEmail,
        usuarioRegAtivo: 'S',
      });

      await queryRunner.manager.save(usuario);

      await queryRunner.commitTransaction();

      return clienteSalvo;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async removerCliente(clienteId: number | string) {
    const normalizedId = clienteId.toString();

    await this.usuarioRepo
      .createQueryBuilder()
      .delete()
      .from(UsuarioRegistro)
      .where('usuarioreg_clienteregid = :clienteId', {
        clienteId: normalizedId,
      })
      .execute();

    await this.clienteRepo.delete(normalizedId);
  }

  async criarUsuarioRegistro(data: CriarUsuarioRegistroInput) {
    const usuario = this.usuarioRepo.create({
      cliente: { clienteRegId: data.clienteId.toString() } as ClienteRegistro,
      usuarioRegEmail: data.email,
      usuarioRegAtivo: 'S',
    });

    return this.usuarioRepo.save(usuario);
  }
}
