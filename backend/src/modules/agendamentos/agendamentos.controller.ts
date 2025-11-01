import { Body, Controller, Get, Param, Post, Patch, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAgendamentoDto, UpdateAgendamentoDto } from './dto/create-agendamento.dto';
import { AgendamentosService } from './agendamentos.service';

@Controller('agendamentos')
@UseGuards(JwtAuthGuard)
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Get()
  getAgendamentos(@Query('empresaId') empresaId: string) {
    return this.agendamentosService.findAgendamentos(empresaId);
  }

  @Post()
  createAgendamento(@Body() createAgendamentoDto: CreateAgendamentoDto) {
    return this.agendamentosService.createAgendamento(createAgendamentoDto);
  }

  @Patch(':id')
  updateAgendamento(@Param('id') id: string, @Body() updateAgendamentoDto: UpdateAgendamentoDto) {
    return this.agendamentosService.updateAgendamento(id, updateAgendamentoDto);
  }
}
