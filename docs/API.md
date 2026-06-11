# 物流小程序 API 速查表

> 全局前缀：`logistics-boot`
> 本地开发：`http://localhost:3000/logistics-boot`
> 前端只需把 BASE_URL 指向 `http://localhost:3000/logistics-boot` 即可对接

---

## 认证方式

所有需鉴权接口需在请求头携带：

```
Authorization: Bearer <access-token>
```

---

## 接口列表

### 1. 账号密码登录

| 项 | 值 |
|---|---|
| **路径** | `POST /user/login` |
| **鉴权** | 无（公开） |
| **限流** | 5 次/分/IP |

**请求体**：
```json
{ "username": "admin", "password": "123456" }
```

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 7200,
    "userInfo": {
      "id": "4",
      "username": "admin",
      "nickname": "管理员",
      "phone": "13800000001",
      "avatar": null,
      "role": "admin",
      "certStatus": "0"
    }
  },
  "result": { /* 同 data */ },
  "success": true,
  "timestamp": 1781161679814
}
```

**错误**：
| HTTP | code | 场景 |
|------|------|------|
| 401 | 401 | 账号或密码错误 |
| 400 | 400 | 参数校验失败（username < 4位 / password < 6位） |

---

### 2. 刷新 Token

| 项 | 值 |
|---|---|
| **路径** | `POST /auth/refresh` |
| **鉴权** | 无（公开） |
| **限流** | 30 次/分/IP |

**请求体**：
```json
{ "refreshToken": "eyJhbGciOi..." }
```

**成功响应** (200)：同登录响应，返回新的 token + refreshToken + expiresIn。

**错误**：
| HTTP | code | 场景 |
|------|------|------|
| 401 | 401 | refresh token 已过期或被吊销 |

---

### 3. 退出登录

| 项 | 值 |
|---|---|
| **路径** | `POST /user/logout` |
| **鉴权** | Bearer Token（必填） |

**请求体**：无（可选 `{ "refreshToken": "..." }` 传入 refresh token 以便服务端吊销）

**成功响应** (200)：
```json
{ "code": 200, "message": "退出成功", "data": { "ok": true }, "success": true, "timestamp": ... }
```

---

### 4. 微信一键登录（jsCode 换 JWT）

| 项 | 值 |
|---|---|
| **路径** | `POST /wechat/jscode2session` |
| **鉴权** | 无（公开） |
| **限流** | 10 次/分/IP |

**请求体**：
```json
{ "jsCode": "微信 wx.login() 返回的 code", "type": "mp-weixin" }
```

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 7200,
    "userInfo": { "id": "7", "username": null, "nickname": "微信用户f024", "phone": null, "avatar": null, "role": "shipper", "certStatus": "0" },
    "isNew": true
  },
  "success": true,
  "timestamp": ...
}
```

- `isNew=true`：首次登录，系统自动创建账号
- `isNew=false`：已有账号，直接登录

---

### 5. 绑定手机号（getPhoneNumber）

| 项 | 值 |
|---|---|
| **路径** | `POST /wechat/phone` |
| **鉴权** | Bearer Token（必填） |

**请求体**：
```json
{
  "encryptedData": "getPhoneNumber 回调的加密数据",
  "iv": "getPhoneNumber 回调的 iv",
  "code": "可选，再次 wx.login() 获取的 code（用于换 sessionKey）"
}
```

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "手机号绑定成功",
  "data": { "phone": "13800138000", "userInfo": { ... } },
  "success": true,
  "timestamp": ...
}
```

---

### 6. 获取当前用户信息

| 项 | 值 |
|---|---|
| **路径** | `GET /user/info` |
| **鉴权** | Bearer Token（必填） |

**成功响应** (200)：
```json
{
  "code": 200,
  "data": {
    "id": "4", "username": "admin", "nickname": "管理员",
    "phone": "13800000001", "avatar": null, "role": "admin",
    "certStatus": "0", "companyName": null, "mpOpenid": null
  },
  "success": true,
  "timestamp": ...
}
```

---

### 7. 更新用户资料

| 项 | 值 |
|---|---|
| **路径** | `PATCH /user/profile` |
| **鉴权** | Bearer Token（必填） |

**请求体**（全部可选）：
```json
{ "nickname": "新昵称", "avatar": "https://...", "phone": "13800000001" }
```

**成功响应** (200)：返回更新后的 userInfo。

---

## 统一错误格式

所有错误均返回：

```json
{
  "code": 401,
  "message": "token 失效或未登录",
  "data": null,
  "result": null,
  "success": false,
  "timestamp": ...
}
```

### 常见错误码

| HTTP | code | 含义 |
|------|------|------|
| 400 | 400 | 参数校验失败 |
| 401 | 401 | 未登录 / token 失效 / token 被踢出 |
| 403 | 403 | 权限不足 |
| 404 | 404 | 资源不存在 |
| 429 | 429 | 请求过于频繁（限流） |
| 500 | 500 | 服务器内部错误 |
| 502 | 502 | 微信服务暂时不可用 |

---

## Token 说明

| 字段 | 说明 |
|------|------|
| `token` | access token，有效期 **2 小时** |
| `refreshToken` | refresh token，有效期 **14 天** |
| `expiresIn` | access token 有效秒数（7200） |

- access 过期后用 refresh 换新的双 token
- refresh 是轮换的：每次 refresh 后旧 refresh 作废
- 退出登录会使该用户所有 token 失效（jwtVersion + 1）
- 前端应在 `Authorization: Bearer <token>` 中携带 access token

---

## 旧 /sys/* 接口（已弃用）

以下接口保留一版后下线，Swagger 标记为 `deprecated`：

| 旧路径 | 替代接口 |
|--------|----------|
| `POST /sys/sms` | 无直接替代（短信验证码本期未启用） |
| `POST /sys/smslogin` | `POST /user/login` |
| `POST /sys/quicklogin` | `POST /wechat/jscode2session`（已对接新逻辑，行为一致） |
| `GET /sys/user/getUserInfo` | `GET /user/info`（改用 Bearer token） |
| `GET /sys/logout` | `POST /user/logout` |
| `POST /sys/mpSet` | `POST /wechat/jscode2session` 自动绑定 |

---

## 钱包模块

### 8. 货主钱包-我的

| 项 | 值 |
|---|---|
| **路径** | `GET /wallet/shipper/wallet/my` |
| **鉴权** | Bearer Token（必填）+ 角色 `shipper` |
| **限流** | 全局 60 次/分/IP |

**请求体**：无

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "balance": 0,
    "todayIncome": 0,
    "totalIncome": 0,
    "pendingSettlement": 0,
    "frozen": 0,
    "points": 0
  },
  "result": { /* 同 data */ },
  "success": true,
  "timestamp": ...
}
```

> 首次访问自动开户。司机端另有 `GET /wallet/driver/wallet/my`（同结构，角色 `driver`）。
