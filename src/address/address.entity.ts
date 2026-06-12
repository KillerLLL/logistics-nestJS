import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('gy_company_load_addr')
@Index('idx_company_id', ['companyId'])
export class Address {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ name: 'company_id', type: 'bigint', unsigned: true, comment: '公司 id（当前为 user.id）' })
  companyId: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '装货地名称' })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '联系人' })
  linkman: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '联系方式' })
  phone: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '省' })
  province: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '市' })
  city: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '区/县' })
  district: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '街道/乡镇' })
  street: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '完整行政区划' })
  addr: string;

  @Column({ name: 'address_code', type: 'varchar', length: 100, nullable: true, comment: '地址编码 省,市,区,街道' })
  addressCode: string;

  @Column({ name: 'address_detail', type: 'varchar', length: 500, nullable: true, comment: '详细地址' })
  addressDetail: string;

  @Column({ name: 'whole_name', type: 'varchar', length: 200, nullable: true, comment: '所属区域全称' })
  wholeName: string;

  @Column({ name: 'area_id', type: 'varchar', length: 32, nullable: true, comment: '所属区域 id' })
  areaId: string;

  @Column({ name: 'is_default', type: 'tinyint', default: 0, comment: '是否默认 0-否 1-是' })
  isDefault: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, comment: '纬度' })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, comment: '经度' })
  lng: number;

  @Column({ type: 'tinyint', default: 1, comment: '地点类型 1-城市 2-农村' })
  type: number;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
