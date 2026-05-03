import { serve } from '@hono/node-server'
import app from './app.js'
import { config } from './config.js'

console.log(`🚀 知友后端启动中...`)
console.log(`PORT: ${config.port}`)
console.log(`SDKAppID: ${config.tim.sdkAppId}`)
console.log(`Supabase: ${config.supabase.url}`)

serve({
  fetch: app.fetch,
  port: config.port,
  hostname: '0.0.0.0',
}, (info) => {
  console.log(`✅ 知友后端启动成功: http://0.0.0.0:${config.port}`)
  console.log(`📱 真机调试地址: http://192.168.1.33:${config.port}`)
})
