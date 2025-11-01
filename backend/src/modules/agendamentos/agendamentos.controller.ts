import { Body, Controller, Get, Param, Post, Patch, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAgendamentoDto, UpdateAgendamentoDto } from './dto/create-agendamento.dto';
import { AgendamentosService } from './agendamentos.service';

@Controller('agendamentos')
@UseGuards(JwtAuthGuard)
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Get()
  getAgendamentos(@Request() req: any) {
    const empresaId = req.user.empresaId;
    if (!empresaId) {
      throw new BadRequestException('EmpresaId não encontrado no token');
    }
    return this.agendamentosService.findAgendamentos(empresaId);
  }

  @Post()
  createAgendamento(@Body() createAgendamentoDto: CreateAgendamentoDto, @Request() req: any) {
    const empresaId = req.user.empresaId;
    if (!empresaId) {
      throw new BadRequestException('EmpresaId não encontrado no token');
    }
    return this.agendamentosService.createAgendamento(createAgendamentoDto, empresaId);
  }

  @Patch(':id')
  updateAgendamento(@Param('id') id: string, @Body() updateAgendamentoDto: UpdateAgendamentoDto, @Request() req: any) {
    const empresaId = req.user.empresaId;
    if (!empresaId) {
      throw new BadRequestException('EmpresaId não encontrado no token');
    }
    return this.agendamentosService.updateAgendamento(id, updateAgendamentoDto, empresaId);
  }
}
