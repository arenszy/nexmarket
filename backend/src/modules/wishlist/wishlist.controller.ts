import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('wishlist')
@Controller({ path: 'wishlist', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get wishlist' })
  getWishlist(@GetUser('id') userId: string) {
    return this.wishlistService.getWishlist(userId);
  }

  @Post(':productId/toggle')
  @ApiOperation({ summary: 'Toggle wishlist item' })
  toggle(@GetUser('id') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.toggle(userId, productId);
  }

  @Get(':productId/check')
  @ApiOperation({ summary: 'Check if product is wishlisted' })
  check(@GetUser('id') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.isWishlisted(userId, productId);
  }
}
