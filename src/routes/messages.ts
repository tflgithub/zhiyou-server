// 消息存储与历史拉取
// POST /api/messages/send — 存储消息到服务器
// GET /api/messages/list — 获取两人聊天历史

import { Hono } from 'hono'
import { supabase } from '../db.js'

const router = new Hono()

/**
 * 存储消息
 * POST /api/messages/send
 * Body: { fromUserId, toUserId, content, msgType }
 */
router.post('/send', async (c) => {
  try {
    const { fromUserId, toUserId, content, msgType } = await c.req.json()

    if (!fromUserId || !toUserId || !content) {
      return c.json({ code: 400, message: '参数错误' }, 400)
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        from_user: fromUserId,
        to_user: toUserId,
        content: content,
        msg_type: msgType || 'text'
      })
      .select()
      .single()

    if (error) {
      console.error('存储消息失败:', error)
      return c.json({ code: 500, message: '存储失败' }, 500)
    }

    return c.json({ code: 0, data: { id: data.id, createdAt: data.created_at } })
  } catch (err) {
    console.error('存储消息出错:', err)
    return c.json({ code: 500, message: '服务器错误' }, 500)
  }
})

/**
 * 获取聊天历史
 * GET /api/messages/list?userId=xxx&friendId=xxx&limit=50&before=id
 */
router.get('/list', async (c) => {
  try {
    const userId = c.req.query('userId')
    const friendId = c.req.query('friendId')
    const limit = parseInt(c.req.query('limit') || '50', 10)
    const before = c.req.query('before') // 分页：之前最后一条消息的ID

    if (!userId || !friendId) {
      return c.json({ code: 400, message: '缺少参数' }, 400)
    }

    // 查询两人之间的双向消息
    let query = supabase
      .from('messages')
      .select('*')
      .or(`and(from_user.eq.${userId},to_user.eq.${friendId}),and(from_user.eq.${friendId},to_user.eq.${userId})`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('id', before)
    }

    const { data, error } = await query

    if (error) {
      console.error('查询消息失败:', error)
      return c.json({ code: 500, message: '查询失败' }, 500)
    }

    // 按时间正序返回（最旧的在前）
    const messages = (data || []).reverse().map(msg => ({
      id: msg.id,
      fromUserId: msg.from_user,
      toUserId: msg.to_user,
      content: msg.content,
      msgType: msg.msg_type,
      createdAt: msg.created_at,
      isSelf: msg.from_user === userId
    }))

    return c.json({
      code: 0,
      data: {
        messages,
        hasMore: (data || []).length >= limit
      }
    })
  } catch (err) {
    console.error('查询消息出错:', err)
    return c.json({ code: 500, message: '服务器错误' }, 500)
  }
})

export default router
