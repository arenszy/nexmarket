import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: { children: { where: { isActive: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(slug: string) {
    const cat = await this.prisma.category.findUnique({
      where: { slug },
      include: { children: true, _count: { select: { products: true } } },
    });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(dto: { name: string; description?: string; image?: string; parentId?: string }) {
    const slug = slugify(dto.name, { lower: true, strict: true });
    return this.prisma.category.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: any) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }
}
