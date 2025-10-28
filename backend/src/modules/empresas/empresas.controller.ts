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
import { CreateEmpresaDto, UpdateEmpresaDto } from './dto/create-empresa.dto';
import { EmpresasService } from './empresas.service';

@Controller('empresas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresasService.create(createEmpresaDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  findAll(@Query() pagination: any) {
    return this.empresasService.findAll(pagination);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.empresasService.findOne(id);
  }

  @Get(':id/metrics')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  getMetrics(@Param('id') id: string) {
    return this.empresasService.getMetrics(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  update(@Param('id') id: string, @Body() updateEmpresaDto: UpdateEmpresaDto) {
    return this.empresasService.update(id, updateEmpresaDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.empresasService.remove(id);
  }

  @Patch(':id/toggle-status')
  @Roles(Role.SUPER_ADMIN)
  toggleStatus(@Param('id') id: string) {
    return this.empresasService.toggleStatus(id);
  }
}
