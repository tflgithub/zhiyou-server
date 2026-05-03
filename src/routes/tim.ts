// UserSig 生成 - 腾讯云IM签名服务
// 使用腾讯官方 tls-sig-api-v2

import TLSSigAPIv2 from 'tls-sig-api-v2'
import { config } from '../config.js'

export function generateUserSig(userId: string): [string, number] {
  const api = new TLSSigAPIv2.Api(config.tim.sdkAppId, config.tim.secret)
  const expire = 86400 * 7 // 7天有效期

  const userSig = api.genUserSig(userId, expire)
  const expireTime = Math.floor(Date.now() / 1000) + expire

  return [userSig, expireTime]
}
