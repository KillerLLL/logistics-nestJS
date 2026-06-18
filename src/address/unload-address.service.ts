import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnloadAddress } from './unload-address.entity';
import { CreateAddressDto, UpdateAddressDto } from './address.dto';

/**
 * 收货地址（卸货地）Service。
 * 业务逻辑与发货地址 AddressService 完全一致，
 * 仅操作表 gy_company_unload_addr（UnloadAddress 实体）。
 */
@Injectable()
export class UnloadAddressService {
  constructor(
    @InjectRepository(UnloadAddress)
    private readonly repo: Repository<UnloadAddress>,
  ) {}

  async list(companyId: string, pageNo: number, pageSize: number, keywords?: string) {
    const qb = this.repo.createQueryBuilder('a')
      .where('a.companyId = :companyId', { companyId });

    if (keywords) {
      qb.andWhere(
        '(a.name LIKE :kw OR a.linkman LIKE :kw OR a.phone LIKE :kw OR a.addressDetail LIKE :kw)',
        { kw: `%${keywords}%` },
      );
    }

    qb.orderBy('a.isDefault', 'DESC')
      .addOrderBy('a.updateTime', 'DESC');

    const total = await qb.getCount();
    const records = await qb
      .skip((pageNo - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return {
      records,
      total,
      current: pageNo,
      pages: Math.ceil(total / pageSize),
      size: pageSize,
    };
  }

  async findById(id: string, companyId: string) {
    return this.repo.findOne({ where: { id, companyId } });
  }

  async add(companyId: string, dto: CreateAddressDto) {
    if (dto.isDefault === 1) {
      await this.clearDefault(companyId);
    }
    const entity = this.repo.create({ ...dto, companyId });
    return this.repo.save(entity);
  }

  async edit(companyId: string, dto: UpdateAddressDto) {
    const { id, ...rest } = dto;
    const existing = await this.repo.findOne({ where: { id, companyId } });
    if (!existing) return null;

    if (rest.isDefault === 1) {
      await this.clearDefault(companyId);
    }

    Object.assign(existing, rest);
    return this.repo.save(existing);
  }

  async remove(id: string, companyId: string) {
    const result = await this.repo.delete({ id, companyId });
    return (result.affected ?? 0) > 0;
  }

  private async clearDefault(companyId: string) {
    await this.repo.update({ companyId, isDefault: 1 }, { isDefault: 0 });
  }
}
