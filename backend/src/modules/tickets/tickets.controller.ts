import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TicketsService } from './tickets.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  getTickets(@Param('empresaId') empresaId: string) {
    return this.ticketsService.findTickets(empresaId);
  }

  @Post()
  createTicket(@Body() data: any) {
    return this.ticketsService.createTicket(data);
  }

  @Post(':id')
  updateTicket(@Param('id') id: string, @Body() data: any) {
    return this.ticketsService.updateTicket(id, data);
  }
}
