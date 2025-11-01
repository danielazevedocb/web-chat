import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'Refresh token é obrigatório' })
  @IsNotEmpty({ message: 'Refresh token não pode estar vazio' })
  refreshToken: string;
}

