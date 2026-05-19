import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShopsService } from './shops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateShopDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() province?: string;
}

@ApiTags('shops')
@Controller({ path: 'shops', version: '1' })
export class ShopsController {
  constructor(private shopsService: ShopsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new shop' })
  create(@GetUser('id') userId: string, @Body() dto: CreateShopDto) {
    return this.shopsService.create(userId, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get my shop' })
  getMyShop(@GetUser('id') userId: string) {
    return this.shopsService.findByUserId(userId);
  }

  @Get('my/dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get seller dashboard stats' })
  getDashboard(@GetUser() user: any) {
    return this.shopsService.getDashboardStats(user.shop?.id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get shop by slug' })
  findOne(@Param('slug') slug: string) {
    return this.shopsService.findBySlug(slug);
  }

  @Put('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update my shop' })
  update(@GetUser('id') userId: string, @Body() dto: any) {
    return this.shopsService.update(userId, dto);
  }
}
