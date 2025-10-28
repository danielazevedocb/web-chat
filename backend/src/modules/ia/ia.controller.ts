import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IAService } from './ia.service';

@Controller('ia')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class IAController {
  constructor(private readonly iaService: IAService) {}

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('responder')
  async generateResponse(@Body() data: any) {
    return this.iaService.generateResponse(data.empresaId, data.mensagem, data.historico);
  }
}
