import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class EnderecoDto {
  @IsString()
  @Length(1, 150)
  cidade: string;

  @IsString()
  @Length(1, 150)
  bairro: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  cep?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipoLogradouro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  pessoa_tipologradouro?: string;

  @IsString()
  @Length(1, 200)
  logradouro: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  numero?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  complemento?: string;

  @IsString()
  @Length(2, 2)
  uf: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  estadoCodigo?: string;
}

export class ContatoDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  celular?: string;
}

export class CreateClienteDto {
  @IsString()
  razao: string;

  @IsString()
  nomeFantasia: string;

  @IsString()
  cnpj: string;

  @IsString()
  adminNome: string;

  @IsString()
  adminLogin: string;

  @IsEmail()
  adminEmail: string;

  @IsOptional()
  @IsString()
  adminSenha?: string;

  @ValidateNested()
  @Type(() => EnderecoDto)
  endereco: EnderecoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContatoDto)
  contato?: ContatoDto;
}
