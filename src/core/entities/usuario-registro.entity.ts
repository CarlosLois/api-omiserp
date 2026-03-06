import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ClienteRegistro } from './cliente-registro.entity';

@Entity({ name: 'usuario_registro' })
export class UsuarioRegistro {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'usuarioreg_id',
  })
  usuarioRegId: string;

  @ManyToOne(() => ClienteRegistro)
  @JoinColumn({
    name: 'usuarioreg_clienteregid',
    referencedColumnName: 'clienteRegId',
  })
  cliente: ClienteRegistro;

  @Index({ unique: true })
  @Column({
    name: 'usuarioreg_email',
    type: 'varchar',
    length: 150,
  })
  usuarioRegEmail: string;

  @Column({
    name: 'usuarioreg_ativo',
    type: 'char',
    length: 1,
  })
  usuarioRegAtivo: string;

  @Column({
    name: 'usuarioreg_datacadastro',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  usuarioRegDataCadastro: Date;
}
