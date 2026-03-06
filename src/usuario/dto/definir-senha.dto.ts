import { IsEmail, IsString, Length } from 'class-validator';

export class DefinirSenhaDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 100, {
    message: 'A senha deve ter no minimo 6 caracteres.',
  })
  senha: string;
}
