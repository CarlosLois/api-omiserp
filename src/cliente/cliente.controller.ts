import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { CnpjService } from './services/cnpj.service';

@Controller('clientes')
export class ClienteController {
  constructor(
    private readonly clienteService: ClienteService,
    private readonly cnpjService: CnpjService,
  ) {}

  @Post('registrar')
  async registrar(@Body() dto: CreateClienteDto) {
    return this.clienteService.registrarCliente(dto);
  }

  @Get('consultar-cnpj/:cnpj')
  async consultarCnpj(@Param('cnpj') cnpj: string) {
    return this.cnpjService.consultar(cnpj);
  }
}
