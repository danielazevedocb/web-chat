import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { IntegracoesService } from './integracoes.service';

@Controller('integracoes')
export class IntegracoesController {
  constructor(private readonly integracoesService: IntegracoesService) {}

  @Public()
  @Post('webhook')
  processWebhook(@Body() data: any) {
    return this.integracoesService.processWebhook(data);
  }

  @Post('whatsapp')
  sendToWhatsApp(@Body() data: any) {
    return this.integracoesService.sendToWhatsApp(data);
  }

  @Post('telegram')
  sendToTelegram(@Body() data: any) {
    return this.integracoesService.sendToTelegram(data);
  }
}
