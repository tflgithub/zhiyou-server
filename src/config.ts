// 配置管理

import dotenv from 'dotenv'
dotenv.config()

function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) {
    console.warn(`⚠️ Missing env: ${key}`)
    return ''
  }
  return val
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  wx: {
    appId: requireEnv('WX_APPID'),
    secret: requireEnv('WX_SECRET'),
  },
  tim: {
    sdkAppId: parseInt(requireEnv('TIM_SDKAPPID'), 10),
    secret: requireEnv('TIM_SECRET'),
  },
  supabase: {
    url: requireEnv('SUPABASE_URL'),
    anonKey: requireEnv('SUPABASE_ANON_KEY'),
    serviceRole: requireEnv('SUPABASE_SERVICE_ROLE'),
  },
  map: {
    key: process.env.MAP_KEY || '',
  },
}
