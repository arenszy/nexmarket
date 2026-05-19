import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'buyer@shopeeclone.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Buyer@123456' })
  @IsString()
  password: string;
}
