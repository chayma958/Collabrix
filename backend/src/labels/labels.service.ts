import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@Injectable()
export class LabelsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateLabelDto) {
    return this.prisma.label.create({
      data: { workspaceId: dto.workspaceId, name: dto.name, color: dto.color },
    });
  }

  listByWorkspace(workspaceId: string) {
    return this.prisma.label.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(labelId: string, dto: UpdateLabelDto) {
    await this.assertExists(labelId);
    return this.prisma.label.update({ where: { id: labelId }, data: dto });
  }

  async remove(labelId: string) {
    await this.assertExists(labelId);
    await this.prisma.label.delete({ where: { id: labelId } });
  }

  private async assertExists(labelId: string) {
    const label = await this.prisma.label.findUnique({
      where: { id: labelId },
    });
    if (!label) {
      throw new NotFoundException('Label not found');
    }
    return label;
  }
}
