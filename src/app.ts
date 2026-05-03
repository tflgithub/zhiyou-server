import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRouter from './routes/auth.js'
import userRouter from './routes/user.js'
import contactsRouter from './routes/contacts.js'
import messagesRouter from './routes/messages.js'
import { config } from './config.js'

const app = new Hono()

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}))

// 错误处理
app.onError((err, c) => {
  console.error('API错误:', err)
  return c.json({ code: 500, message: '服务器错误: ' + err.message }, 500)
})

app.get('/', (c) => c.json({
  name: '知友 API',
  version: '1.0',
  status: 'running',
  tim: config.tim.sdkAppId ? `SDKAppID: ${config.tim.sdkAppId}` : '未配置',
  supabase: config.supabase.url ? '已连接' : '未配置'
}))

// Routes
app.route('/api/auth', authRouter)
app.route('/api/user', userRouter)
app.route('/api/contacts', contactsRouter)
app.route('/api/messages', messagesRouter)

export default app
