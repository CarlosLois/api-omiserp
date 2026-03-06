import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'usuario_id',
  })
  usuarioId: number;

  @Index({ unique: true })
  @Column({
    name: 'usuario_login',
    type: 'varchar',
    length: 100,
  })
  usuarioLogin: string;

  @Column({
    name: 'usuario_nome',
    type: 'varchar',
    length: 200,
  })
  usuarioNome: string;

  @Column({
    name: 'usuario_email',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  usuarioEmail: string;

  @Column({
    name: 'usuario_senha',
    type: 'varchar',
    length: 200,
  })
  usuarioSenha: string;

  @Column({
    name: 'usuario_ativo',
    type: 'char',
    length: 1,
  })
  usuarioAtivo: string;

  @Column({
    name: 'usuario_dtcadastro',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  usuarioDtCadastro: Date;

  @Column({
    name: 'usuario_dtalteracao',
    type: 'date',
    nullable: true,
  })
  usuarioDtAlteracao: Date;

  @Column({
    name: 'usuario_dtbloqueio',
    type: 'date',
    nullable: true,
  })
  usuarioDtBloqueio: Date;

  @Column({
    name: 'usuario_motivobloqueio',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  usuarioMotivoBloqueio: string;
}
