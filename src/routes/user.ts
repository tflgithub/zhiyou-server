// 用户信息
// GET /api/user/profile — 获取用户信息
// PUT /api/user/profile — 更新用户信息

import { Hono } from 'hono'
import { supabase } from '../db.js'

const router = new Hono()

router.get('/profile', async (c) => {
  const userId = c.req.query('userId')
  if (!userId) {
    return c.json({ code: 400, message: '缺少userId' }, 400)
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return c.json({ code: 404, message: '用户不存在' }, 404)
  }

  return c.json({
    code: 0,
    data: {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone_hash ? '已绑定' : '未绑定',
      createdAt: user.created_at
    }
  })
})

router.put('/profile', async (c) => {
  const body = await c.req.json()
  const { userId, nickname, avatar, bio } = body

  if (!userId) {
    return c.json({ code: 400, message: '缺少userId' }, 400)
  }

  const updates: any = {}
  if (nickname) updates.nickname = nickname
  if (avatar) updates.avatar = avatar
  if (bio !== undefined) updates.bio = bio

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)

  if (error) {
    return c.json({ code: 500, message: '更新失败' }, 500)
  }

  return c.json({ code: 0, message: '更新成功' })
})

export default router
