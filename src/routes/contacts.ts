// 联系人匹配
// POST /api/contacts/match — 上传手机号哈希列表，返回已注册的好友
// POST /api/contacts/add — 添加好友
// GET /api/contacts/list — 好友列表
// PUT /api/contacts/update-phone — 绑定手机号

import { Hono } from 'hono'
import { supabase } from '../db.js'

const router = new Hono()

/**
 * 匹配通讯录好友
 * POST /api/contacts/match
 * Body: { userId, phones: ["sha256hash1", "sha256hash2", ...] }
 */
router.post('/match', async (c) => {
  try {
    const { userId, phones } = await c.req.json()

    if (!userId || !phones || !Array.isArray(phones) || phones.length === 0) {
      return c.json({ code: 400, message: '参数错误' }, 400)
    }

    // 查询手机号哈希匹配的用户
    const { data: matchedUsers, error } = await supabase
      .from('users')
      .select('id, nickname, avatar, phone_hash')
      .in('phone_hash', phones)
      .neq('id', userId) // 排除自己

    if (error) {
      console.error('匹配失败:', error)
      return c.json({ code: 500, message: '匹配失败' }, 500)
    }

    // 获取已经是好友的ID列表
    const { data: existingFriends } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', userId)
      .eq('status', 'accepted')

    const friendIds = new Set((existingFriends || []).map(f => f.friend_id))

    // 获取已发送好友请求的ID
    const { data: pendingRequests } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', userId)
      .eq('status', 'pending')

    const pendingIds = new Set((pendingRequests || []).map(f => f.friend_id))

    // 格式化返回
    const matched = (matchedUsers || []).map(u => ({
      id: u.id,
      nickname: u.nickname,
      avatar: u.avatar,
      phone_last4: u.phone_hash ? u.phone_hash.substring(0, 4) : '',
      status: friendIds.has(u.id) ? 'friend' : pendingIds.has(u.id) ? 'pending' : 'new'
    }))

    return c.json({
      code: 0,
      data: {
        total: matched.length,
        contacts: matched
      }
    })
  } catch (err) {
    console.error('匹配失败:', err)
    return c.json({ code: 500, message: '服务器错误' }, 500)
  }
})

/**
 * 发送好友请求
 */
router.post('/add', async (c) => {
  try {
    const { userId, friendId } = await c.req.json()

    if (!userId || !friendId) {
      return c.json({ code: 400, message: '参数错误' }, 400)
    }

    if (userId === friendId) {
      return c.json({ code: 400, message: '不能添加自己为好友' }, 400)
    }

    // 检查对方用户是否存在
    const { data: friendUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', friendId)
      .maybeSingle()

    if (userError || !friendUser) {
      return c.json({ code: 404, message: '用户不存在' }, 404)
    }

    // 检查是否已经是好友
    const { data: existing } = await supabase
      .from('friendships')
      .select('*')
      .eq('user_id', userId)
      .eq('friend_id', friendId)
      .maybeSingle()

    if (existing) {
      if (existing.status === 'accepted') {
        return c.json({ code: 0, message: '已经是好友了' })
      }
      return c.json({ code: 0, message: '已发送过请求' })
    }

    // 创建双向好友关系 - 扫码添加直接通过
    const { error: e1 } = await supabase
      .from('friendships')
      .insert({ user_id: userId, friend_id: friendId, status: 'accepted' })

    const { error: e2 } = await supabase
      .from('friendships')
      .insert({ user_id: friendId, friend_id: userId, status: 'accepted' })

    if (e1 || e2) {
      console.error('添加好友失败:', e1, e2)
      return c.json({ code: 500, message: '添加失败' }, 500)
    }

    console.log(`好友请求已发送: ${userId} -> ${friendId}`)
    return c.json({ code: 0, message: '添加好友成功' })
  } catch (err) {
    console.error('添加好友出错:', err)
    return c.json({ code: 500, message: '服务器错误' }, 500)
  }
})

/**
 * 获取好友请求列表（待处理）
 */
router.get('/pending', async (c) => {
  const userId = c.req.query('userId')
  if (!userId) {
    return c.json({ code: 400, message: '缺少userId' }, 400)
  }

  // 查询待处理的好友请求（别人申请加我）
  const { data: requests, error } = await supabase
    .from('friendships')
    .select('user_id, created_at')
    .eq('friend_id', userId)
    .eq('status', 'pending')

  if (error) {
    return c.json({ code: 500, message: '查询失败' }, 500)
  }

  if (!requests || requests.length === 0) {
    return c.json({ code: 0, data: [] })
  }

  // 获取申请人信息
  const userIds = requests.map(r => r.user_id)
  const { data: users } = await supabase
    .from('users')
    .select('id, nickname, avatar')
    .in('id', userIds)

  const emitterojis = ['😊','👋','🐱','🐶','🐰','🐼','🦊','🦋','🐙','🐧']
  const result = (users || []).map((u, i) => ({
    id: u.id,
    nickname: u.nickname,
    avatar: u.avatar,
    avatarEmoji: emitterojis[i % emitterojis.length],
    createdAt: requests.find(r => r.user_id === u.id)?.created_at || ''
  }))

  return c.json({ code: 0, data: result })
})

/**
 * 同意好友请求
 */
router.post('/accept', async (c) => {
  const { userId, requesterId } = await c.req.json()
  if (!userId || !requesterId) {
    return c.json({ code: 400, message: '参数错误' }, 400)
  }

  // 更新两条记录为 accepted
  const { error: e1 } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('user_id', requesterId)
    .eq('friend_id', userId)

  const { error: e2 } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('user_id', userId)
    .eq('friend_id', requesterId)

  if (e1 || e2) {
    return c.json({ code: 500, message: '操作失败' }, 500)
  }

  return c.json({ code: 0, message: '已同意好友请求' })
})

/**
 * 拒绝好友请求
 */
router.post('/decline', async (c) => {
  const { userId, requesterId } = await c.req.json()
  if (!userId || !requesterId) {
    return c.json({ code: 400, message: '参数错误' }, 400)
  }

  // 删除两条记录
  const { error: e1 } = await supabase
    .from('friendships')
    .delete()
    .eq('user_id', requesterId)
    .eq('friend_id', userId)

  const { error: e2 } = await supabase
    .from('friendships')
    .delete()
    .eq('user_id', userId)
    .eq('friend_id', requesterId)

  if (e1 || e2) {
    return c.json({ code: 500, message: '操作失败' }, 500)
  }

  return c.json({ code: 0, message: '已拒绝好友请求' })
})

/**
 * 获取好友列表（返回所有已注册用户，排除自己）
 */
router.get('/list', async (c) => {
  const userId = c.req.query('userId')
  if (!userId) {
    return c.json({ code: 400, message: '缺少userId' }, 400)
  }

  const { data: users, error } = await supabase
    .from('users')
    .select('id, nickname, avatar')
    .neq('id', userId)

  if (error) {
    return c.json({ code: 500, message: '查询失败' }, 500)
  }

  return c.json({ code: 0, data: users || [] })
})

/**
 * 绑定手机号
 */
router.put('/update-phone', async (c) => {
  const { userId, phoneHash } = await c.req.json()
  if (!userId || !phoneHash) {
    return c.json({ code: 400, message: '参数错误' }, 400)
  }

  const { error } = await supabase
    .from('users')
    .update({ phone_hash: phoneHash })
    .eq('id', userId)

  if (error) {
    return c.json({ code: 500, message: '绑定失败' }, 500)
  }

  return c.json({ code: 0, message: '绑定成功' })
})

export default router
