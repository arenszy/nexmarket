import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('admin')
@Controller({ path: 'admin', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  getUsers(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string) {
    return this.adminService.getUsers(page, limit, search);
  }

  @Patch('users/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle user active status' })
  toggleUser(@Param('id') id: string) {
    return this.adminService.toggleUserStatus(id);
  }

  @Get('shops')
  @ApiOperation({ summary: 'Get all shops' })
  getShops(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: string) {
    return this.adminService.getShops(page, limit, status);
  }

  @Patch('shops/:id/status')
  @ApiOperation({ summary: 'Update shop status' })
  updateShopStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateShopStatus(id, status);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders' })
  getOrders(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: string) {
    return this.adminService.getOrders(page, limit, status);
  }

  @Get('banners')
  @ApiOperation({ summary: 'Get all banners' })
  getBanners() {
    return this.adminService.getBanners();
  }

  @Post('banners')
  @ApiOperation({ summary: 'Create banner' })
  createBanner(@Body() dto: any) {
    return this.adminService.createBanner(dto);
  }

  @Put('banners/:id')
  @ApiOperation({ summary: 'Update banner' })
  updateBanner(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateBanner(id, dto);
  }

  @Delete('banners/:id')
  @ApiOperation({ summary: 'Delete banner' })
  deleteBanner(@Param('id') id: string) {
    return this.adminService.deleteBanner(id);
  }
}
