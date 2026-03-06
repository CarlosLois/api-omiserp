import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 200)
  nome: string;

  @IsString()
  @IsNotEmpty()
  login: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 100)
  senha: string;
}
