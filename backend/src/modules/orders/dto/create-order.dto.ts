import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty() @IsString() addressId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  cartItemIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
