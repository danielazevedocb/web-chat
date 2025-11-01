import { Body, Controller, Get, Param, Post, Patch, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTicketDto, UpdateTicketDto } from './dto/create-ticket.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  getTickets(@Request() req: any) {
    const empresaId = req.user.empresaId;
    if (!empresaId) {
      throw new BadRequestException('EmpresaId não encontrado no token');
    }
    return this.ticketsService.findTickets(empresaId);
  }

  @Post()
  createTicket(@Body() createTicketDto: CreateTicketDto, @Request() req: any) {
    const empresaId = req.user.empresaId;
    if (!empresaId) {
      throw new BadRequestException('EmpresaId não encontrado no token');
    }
    return this.ticketsService.createTicket(createTicketDto, empresaId);
  }

  @Patch(':id')
  updateTicket(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto, @Request() req: any) {
    const empresaId = req.user.empresaId;
    if (!empresaId) {
      throw new BadRequestException('EmpresaId não encontrado no token');
    }
    return this.ticketsService.updateTicket(id, updateTicketDto, empresaId);
  }
}
