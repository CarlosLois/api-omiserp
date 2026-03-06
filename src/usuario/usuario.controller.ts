import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { DefinirSenhaDto } from './dto/definir-senha.dto';
import { UsuarioService } from './usuario.service';

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async criar(@Body() dto: CreateUsuarioDto) {
    return this.usuarioService.criarUsuario(dto);
  }

  @Post('definir-senha')
  async definirSenha(@Body() dto: DefinirSenhaDto) {
    return this.usuarioService.definirSenha(dto);
  }
}
