import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangePasswordDto, UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obter perfil do usuário atual' })
  @ApiResponse({ status: 200, description: 'Perfil obtido com sucesso' })
  getProfile(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar perfil do usuário atual' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Alterar senha do usuário atual' })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso' })
  changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar usuários por nome ou email' })
  @ApiResponse({ status: 200, description: 'Lista de usuários encontrados' })
  searchUsers(@Query('search') search: string, @Request() req: any) {
    return this.usersService.searchUsers(search, req.user.id);
  }
}

