import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'cliente_registro' })
export class ClienteRegistro {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'clientereg_id',
  })
  clienteRegId: string;

  @Column({
    name: 'clientereg_razao',
    type: 'varchar',
    length: 150,
  })
  clienteRegRazao: string;

  @Column({
    name: 'clientereg_nomefantasia',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  clienteRegNomeFantasia: string;

  @Index({ unique: true })
  @Column({
    name: 'clientereg_cnpj',
    type: 'varchar',
    length: 18,
  })
  clienteRegCnpj: string;

  @Column({
    name: 'clientereg_datacadastro',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  clienteRegDataCadastro: Date;

  @Column({
    name: 'clientereg_ativo',
    type: 'char',
    length: 1,
  })
  clienteRegAtivo: string;

  @Column({
    name: 'clientereg_dbhost',
    type: 'varchar',
    length: 100,
  })
  clienteRegDbHost: string;

  @Column({
    name: 'clientereg_dbport',
    type: 'integer',
  })
  clienteRegDbPort: number;

  @Column({
    name: 'clientereg_dbname',
    type: 'varchar',
    length: 100,
  })
  clienteRegDbName: string;

  @Column({
    name: 'clientereg_dbuser',
    type: 'varchar',
    length: 60,
  })
  clienteRegDbUser: string;

  @Column({
    name: 'clientereg_dbpassword',
    type: 'varchar',
    length: 150,
  })
  clienteRegDbPassword: string;
}
