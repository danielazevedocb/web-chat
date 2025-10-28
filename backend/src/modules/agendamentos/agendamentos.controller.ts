import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgendamentosService } from './agendamentos.service';

@Controller('agendamentos')
@UseGuards(JwtAuthGuard)
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Get()
  getAgendamentos(@Param('empresaId') empresaId: string) {
    return this.agendamentosService.findAgendamentos(empresaId);
  }

  @Post()
  createAgendamento(@Body() data: any) {
    return this.agendamentosService.createAgendamento(data);
  }

  @Post(':id')
  updateAgendamento(@Param('id') id: string, @Body() data: any) {
    return this.agendamentosService.updateAgendamento(id, data);
  }
}
