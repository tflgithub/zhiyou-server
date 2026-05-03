// 数据库初始化 - Supabase

import { createClient } from '@supabase/supabase-js'
import { config } from './config.js'

export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRole,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function initDatabase() {
  // 表由应用自动创建（通过第一个请求触发）
  console.log('Supabase connected:', config.supabase.url)
}
