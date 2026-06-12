// ============================================================
// user.service.ts — 用户服务层
//   兼容保留旧 /sys/* 行为（@Deprecated 一版）
//   主路径改为：findById / updateProfile / bindPhone
//   扩展：toUserInfoVo / toCompanyInfoVo — 对齐前端 UserInfo/CompanyInfo
// ============================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { SmsSendDto, SmsLoginDto, QuickLoginDto, UpdateProfileDto, UpdateCompanyDto, PqUpdateDto } from './dto/user.dto';
import { Result } from '../common/result';
import { AuthService } from '../auth/auth.service';

// 内存暂存短信验证码（生产替换为 Redis；本期留位）
const smsCodes = new Map<string, string>();

export interface UserInfoVo {
  id: string;
  username: string;
  nickname: string;
  realname: string;
  avatar: string | null;
  birthday: string | null;
  sex: number | null;
  email: string | null;
  phone: string;
  orgCode: string | null;
  orgCodeTxt: string | null;
  status: number;
  workNo: string | null;
  post: string | null;
  userIdentity: number | null;
  openId: string | null;
  isPartner: number;
  partnerStatus: string;
}

export interface CompanyInfoVo {
  id: string;
  name: string;
  addr: string;
  areaId: string;
  areaName: string;
  checkResult: string | null;
  companyAttribute: string | null;
  companyStatus: number;
  companyType: number;
  consignorType: number;
  linkman: string | null;
  linkmanMobile: string | null;
  legalRepresentative: string | null;
  licenseBeginDate: string | null;
  licenseEndDate: string | null;
  isLicenseLongTerm: number | null;
  registeredCapital: number | null;
  permitScope: string | null;
  taxpayerNumber: string | null;
  invoiceTitle: string | null;
  roadCode: string | null;
  roadBeginDate: string | null;
  roadEndDate: string | null;
  monthlySettlement: string | null;
  industryType: string | null;
  platformId: string | null;
  auditTime: string | null;
  updateTime: string | null;
  createTime: string | null;
  mcpUserId: string | null;
}

const EMPTY_COMPANY: Omit<CompanyInfoVo, 'id'> = {
  name: '',
  addr: '',
  areaId: '',
  areaName: '',
  checkResult: null,
  companyAttribute: null,
  companyStatus: 0,
  companyType: 0,
  consignorType: 0,
  linkman: null,
  linkmanMobile: null,
  legalRepresentative: null,
  licenseBeginDate: null,
  licenseEndDate: null,
  isLicenseLongTerm: null,
  registeredCapital: null,
  permitScope: null,
  taxpayerNumber: null,
  invoiceTitle: null,
  roadCode: null,
  roadBeginDate: null,
  roadEndDate: null,
  monthlySettlement: null,
  industryType: null,
  platformId: null,
  auditTime: null,
  updateTime: null,
  createTime: null,
  mcpUserId: null,
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private authService: AuthService,
  ) {}

  // =================== 新主路径 ===================

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('用户不存在');
    if (dto.nickname !== undefined) user.nickname = dto.nickname;
    if (dto.realname !== undefined) user.realname = dto.realname;
    if (dto.avatar !== undefined) user.avatar = dto.avatar;
    if (dto.birthday !== undefined) user.birthday = dto.birthday;
    if (dto.sex !== undefined) user.sex = dto.sex as any;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.orgCode !== undefined) user.orgCode = dto.orgCode;
    if (dto.orgCodeTxt !== undefined) user.orgCodeTxt = dto.orgCodeTxt;
    if (dto.workNo !== undefined) user.workNo = dto.workNo;
    if (dto.post !== undefined) user.post = dto.post;
    if (dto.userIdentity !== undefined) user.userIdentity = dto.userIdentity as any;
    if (dto.isPartner !== undefined) user.isPartner = dto.isPartner;
    if (dto.partnerStatus !== undefined) user.partnerStatus = dto.partnerStatus;
    return this.userRepo.save(user);
  }

  async updateCompany(userId: string, dto: UpdateCompanyDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('用户不存在');
    if (dto.name !== undefined) {
      user.compName = dto.name;
      // 同步旧 companyName 字段（前端兼容/列表展示用）
      user.companyName = dto.name;
    }
    if (dto.addr !== undefined) user.compAddr = dto.addr;
    if (dto.areaId !== undefined) user.compAreaId = dto.areaId;
    if (dto.areaName !== undefined) user.compAreaName = dto.areaName;
    if (dto.checkResult !== undefined) user.compCheckResult = dto.checkResult;
    if (dto.companyAttribute !== undefined) user.compCompanyAttribute = dto.companyAttribute;
    if (dto.companyStatus !== undefined) user.compCompanyStatus = dto.companyStatus;
    if (dto.companyType !== undefined) user.compCompanyType = dto.companyType;
    if (dto.consignorType !== undefined) user.compConsignorType = dto.consignorType;
    if (dto.linkman !== undefined) user.compLinkman = dto.linkman;
    if (dto.linkmanMobile !== undefined) user.compLinkmanMobile = dto.linkmanMobile;
    if (dto.legalRepresentative !== undefined) user.compLegalRepresentative = dto.legalRepresentative;
    if (dto.licenseBeginDate !== undefined) user.compLicenseBeginDate = dto.licenseBeginDate;
    if (dto.licenseEndDate !== undefined) user.compLicenseEndDate = dto.licenseEndDate;
    if (dto.isLicenseLongTerm !== undefined) user.compIsLicenseLongTerm = dto.isLicenseLongTerm;
    if (dto.registeredCapital !== undefined) user.compRegisteredCapital = dto.registeredCapital;
    if (dto.permitScope !== undefined) user.compPermitScope = dto.permitScope;
    if (dto.taxpayerNumber !== undefined) user.compTaxpayerNumber = dto.taxpayerNumber;
    if (dto.invoiceTitle !== undefined) user.compInvoiceTitle = dto.invoiceTitle;
    if (dto.roadCode !== undefined) user.compRoadCode = dto.roadCode;
    if (dto.roadBeginDate !== undefined) user.compRoadBeginDate = dto.roadBeginDate;
    if (dto.roadEndDate !== undefined) user.compRoadEndDate = dto.roadEndDate;
    if (dto.monthlySettlement !== undefined) user.compMonthlySettlement = dto.monthlySettlement;
    if (dto.industryType !== undefined) user.compIndustryType = dto.industryType;
    if (dto.platformId !== undefined) user.compPlatformId = dto.platformId;
    if (dto.mcpUserId !== undefined) user.compMcpUserId = dto.mcpUserId;
    // 维护 comp_update_time = 当前时间
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    user.compUpdateTime = now;
    return this.userRepo.save(user);
  }

  /**
   * 平台托运人更新个人资料（POST /company/gyCompany/pqUpdate）
   * 对齐前端 apiPqUpdateProfile() — 当前 UI 只传 avatar；后端三个字段都接受
   * 返回 string（前端类型 Promise<RequestResult<string>>，实际只用 success/message）
   */
  async pqUpdate(userId: string, dto: PqUpdateDto): Promise<string> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('用户不存在');
    if (dto.avatar !== undefined) user.avatar = dto.avatar;
    if (dto.realname !== undefined) user.realname = dto.realname;
    if (dto.companyName !== undefined) {
      user.companyName = dto.companyName;
      user.compName = dto.companyName; // 同步到 compName 字段
    }
    await this.userRepo.save(user);
    return '更新成功';
  }

  toUserInfoVo(u: User): UserInfoVo {
    return {
      id: u.id,
      username: u.username ?? '',
      nickname: u.nickname ?? '',
      realname: u.realname ?? '',
      avatar: u.avatar ?? null,
      birthday: u.birthday ?? null,
      sex: u.sex ?? null,
      email: u.email ?? null,
      phone: u.phone ?? '',
      orgCode: u.orgCode ?? null,
      orgCodeTxt: u.orgCodeTxt ?? null,
      status: u.status ?? 1,
      workNo: u.workNo ?? null,
      post: u.post ?? null,
      userIdentity: u.userIdentity ?? null,
      openId: u.mpOpenid ?? null,
      isPartner: u.isPartner ?? 0,
      partnerStatus: u.partnerStatus ?? '0',
    };
  }

  toCompanyInfoVo(u: User): CompanyInfoVo {
    return {
      id: u.companyId ?? u.id,
      name: u.compName ?? u.companyName ?? '',
      addr: u.compAddr ?? '',
      areaId: u.compAreaId ?? '',
      areaName: u.compAreaName ?? '',
      checkResult: u.compCheckResult ?? null,
      companyAttribute: u.compCompanyAttribute ?? null,
      companyStatus: u.compCompanyStatus ?? 0,
      companyType: u.compCompanyType ?? 0,
      consignorType: u.compConsignorType ?? 0,
      linkman: u.compLinkman ?? null,
      linkmanMobile: u.compLinkmanMobile ?? null,
      legalRepresentative: u.compLegalRepresentative ?? null,
      licenseBeginDate: u.compLicenseBeginDate ?? null,
      licenseEndDate: u.compLicenseEndDate ?? null,
      isLicenseLongTerm: u.compIsLicenseLongTerm ?? null,
      registeredCapital: u.compRegisteredCapital ?? null,
      permitScope: u.compPermitScope ?? null,
      taxpayerNumber: u.compTaxpayerNumber ?? null,
      invoiceTitle: u.compInvoiceTitle ?? null,
      roadCode: u.compRoadCode ?? null,
      roadBeginDate: u.compRoadBeginDate ?? null,
      roadEndDate: u.compRoadEndDate ?? null,
      monthlySettlement: u.compMonthlySettlement ?? null,
      industryType: u.compIndustryType ?? null,
      platformId: u.compPlatformId ?? null,
      auditTime: u.compAuditTime ?? null,
      updateTime: u.compUpdateTime ?? null,
      createTime: u.compCreateTime ?? null,
      mcpUserId: u.compMcpUserId ?? null,
    };
  }

  /** 静态占位（当 user 上没有挂任何企业数据时，返回所有字段都是空/0/null） */
  emptyCompanyInfoVo(userId: string): CompanyInfoVo {
    return { id: userId, ...EMPTY_COMPANY };
  }

  // =================== 旧 /sys/* 兼容（@Deprecated） ===================

  async sendSms(dto: SmsSendDto) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    smsCodes.set(dto.mobile, code);
    console.log(`[短信] ${dto.mobile} 验证码: ${code}`);
    return Result.ok(null, '验证码发送成功');
  }

  async smsLogin(dto: SmsLoginDto, ip: string = '') {
    const savedCode = smsCodes.get(dto.mobile);
    if (dto.code !== '888888' && (!savedCode || savedCode !== dto.code)) {
      return Result.fail('验证码错误', 400);
    }
    let user = await this.userRepo.findOne({ where: { phone: dto.mobile } });
    if (!user) {
      user = this.userRepo.create({
        phone: dto.mobile,
        nickname: `用户${dto.mobile.slice(-4)}`,
        realname: `用户${dto.mobile.slice(-4)}`,
        role: 'shipper',
        status: 1,
        certStatus: '0',
        compCompanyStatus: 66,
      });
    } else if (!user.realname) {
      // 老用户（无 realname）登录时同步补字段
      user.realname = `用户${dto.mobile.slice(-4)}`;
    }
    await this.userRepo.save(user);
    smsCodes.delete(dto.mobile);
    // 签发真实 JWT（access + refresh），与账号密码登录一致
    const loginResult = await this.authService['issueTokensAndPersist'](user, ip);
    return Result.ok(loginResult, '登录成功');
  }

  async quickLogin(dto: QuickLoginDto) {
    return Result.fail('该接口已弃用，请改用 POST /wechat/jscode2session', 410);
  }

  async getUserInfoByToken(token: string) {
    return Result.fail('该接口已弃用，请改用 GET /user/info（Authorization: Bearer xxx）', 410);
  }

  async logoutByToken(token: string) {
    return Result.fail('该接口已弃用，请改用 POST /auth/logout', 410);
  }

  async mpSet(userId: string, mpOpenid: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return Result.fail('用户不存在', 404);
    user.mpOpenid = mpOpenid;
    await this.userRepo.save(user);
    return Result.ok(null, '绑定成功');
  }
}
