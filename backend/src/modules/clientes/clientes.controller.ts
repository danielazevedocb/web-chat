import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../../../shared/types';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ClientesService } from './clientes.service';
import { CreateClienteDto, UpdateClienteDto } from './dto/create-cliente.dto';

@Controller('clientes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENTE)
  create(
    @Body() createClienteDto: CreateClienteDto,
    @Param('empresaId') empresaId: string,
  ) {
    return this.clientesService.create(createClienteDto, empresaId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENTE)
  findAll(@Query() pagination: any, @Param('empresaId') empresaId: string) {
    return this.clientesService.findAll(pagination, empresaId);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENTE)
  findOne(@Param('id') id: string, @Param('empresaId') empresaId: string) {
    return this.clientesService.findOne(id, empresaId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENTE)
  update(
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
    @Param('empresaId') empresaId: string,
  ) {
    return this.clientesService.update(id, updateClienteDto, empresaId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  remove(@Param('id') id: string, @Param('empresaId') empresaId: string) {
    return this.clientesService.remove(id, empresaId);
  }

  @Patch(':id/toggle-status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  toggleStatus(@Param('id') id: string, @Param('empresaId') empresaId: string) {
    return this.clientesService.toggleStatus(id, empresaId);
  }
}
