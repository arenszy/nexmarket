import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'Admin@123456',
    12,
  );
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@shopeeclone.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@shopeeclone.com',
      password: adminPassword,
      name: 'Admin',
      role: Role.ADMIN,
      isVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Demo seller
  const sellerPassword = await bcrypt.hash('Seller@123456', 12);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@shopeeclone.com' },
    update: {},
    create: {
      email: 'seller@shopeeclone.com',
      password: sellerPassword,
      name: 'Demo Seller',
      role: Role.SELLER,
      isVerified: true,
    },
  });

  // Demo shop
  const shop = await prisma.shop.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      name: 'Demo Store',
      slug: 'demo-store',
      description: 'Welcome to Demo Store — quality products at great prices!',
      status: 'ACTIVE',
      city: 'Jakarta',
      province: 'DKI Jakarta',
    },
  });
  console.log('✅ Demo shop created:', shop.name);

  // Categories
  const categories = [
    { name: 'Electronics', slug: 'electronics', image: '/categories/electronics.png' },
    { name: 'Fashion', slug: 'fashion', image: '/categories/fashion.png' },
    { name: 'Home & Living', slug: 'home-living', image: '/categories/home.png' },
    { name: 'Sports', slug: 'sports', image: '/categories/sports.png' },
    { name: 'Beauty', slug: 'beauty', image: '/categories/beauty.png' },
    { name: 'Food & Beverages', slug: 'food-beverages', image: '/categories/food.png' },
    { name: 'Books', slug: 'books', image: '/categories/books.png' },
    { name: 'Toys & Games', slug: 'toys-games', image: '/categories/toys.png' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true },
    });
  }
  console.log('✅ Categories seeded');

  // Demo products
  const electronicsCategory = await prisma.category.findUnique({
    where: { slug: 'electronics' },
  });

  const products = [
    {
      name: 'Wireless Bluetooth Earbuds Pro',
      slug: 'wireless-bluetooth-earbuds-pro',
      description: 'Premium wireless earbuds with active noise cancellation, 30-hour battery life, and crystal-clear sound quality.',
      price: 299000,
      comparePrice: 450000,
      stock: 150,
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
        'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500',
      ],
      rating: 4.8,
      reviewCount: 234,
      sold: 1205,
    },
    {
      name: 'Smart Watch Series 5',
      slug: 'smart-watch-series-5',
      description: 'Feature-packed smartwatch with health monitoring, GPS, and 7-day battery life.',
      price: 599000,
      comparePrice: 899000,
      stock: 80,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      ],
      rating: 4.6,
      reviewCount: 189,
      sold: 876,
    },
    {
      name: 'USB-C Fast Charger 65W',
      slug: 'usb-c-fast-charger-65w',
      description: 'Universal 65W GaN fast charger compatible with laptops, phones, and tablets.',
      price: 149000,
      comparePrice: 200000,
      stock: 300,
      images: [
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500',
      ],
      rating: 4.7,
      reviewCount: 412,
      sold: 3201,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        price: product.price,
        comparePrice: product.comparePrice,
        shopId: shop.id,
        categoryId: electronicsCategory!.id,
        status: 'ACTIVE',
        tags: ['electronics', 'gadget'],
      },
    });
  }
  console.log('✅ Demo products seeded');

  // Demo buyer
  const buyerPassword = await bcrypt.hash('Buyer@123456', 12);
  await prisma.user.upsert({
    where: { email: 'buyer@shopeeclone.com' },
    update: {},
    create: {
      email: 'buyer@shopeeclone.com',
      password: buyerPassword,
      name: 'Demo Buyer',
      role: Role.BUYER,
      isVerified: true,
    },
  });
  console.log('✅ Demo buyer created');

  // Banners
  const banners = [
    {
      title: 'Flash Sale — Up to 70% Off',
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
      linkUrl: '/flash-sale',
      isActive: true,
      sortOrder: 1,
    },
    {
      title: 'New Arrivals — Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200',
      linkUrl: '/category/electronics',
      isActive: true,
      sortOrder: 2,
    },
  ];

  for (const banner of banners) {
    await prisma.banner.create({ data: banner }).catch(() => {});
  }
  console.log('✅ Banners seeded');

  console.log('\n🎉 Seeding complete!');
  console.log('─────────────────────────────────');
  console.log('Admin:  admin@shopeeclone.com / Admin@123456');
  console.log('Seller: seller@shopeeclone.com / Seller@123456');
  console.log('Buyer:  buyer@shopeeclone.com / Buyer@123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
