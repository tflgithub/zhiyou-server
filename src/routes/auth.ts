// 微信小程序登录
// POST /api/auth/login
// 用 wx.code 换取 openId，注册或登录用户，生成 UserSig

import { Hono } from 'hono'
import { config } from '../config.js'
import { supabase } from '../db.js'
import { generateUserSig } from './tim.js'

const router = new Hono()

router.post('/login', async (c) => {
  try {
    const { code } = await c.req.json()
    if (!code) {
      return c.json({ code: 400, message: '缺少code' }, 400)
    }

    // 1. 用 code 换 openId
    // 注意：本地开发时，可以用测试 openId
    let openId = ''
    let sessionKey = ''

    if (!config.wx.secret) {
      // 开发模式：使用模拟 openId
      openId = 'test_' + code.substring(0, 8)
      sessionKey = 'mock_session_key'
      console.log('⚠️ 开发模式: 使用模拟 openId =', openId)
    } else {
      // 生产模式：调微信API
      const wxRes = await fetch(
        `https://api.weixin.qq.com/sns/jscode2session?appid=${config.wx.appId}&secret=${config.wx.secret}&js_code=${code}&grant_type=authorization_code`
      )
      const wxData = await wxRes.json()
      if (wxData.errcode) {
        return c.json({ code: 400, message: '微信登录失败: ' + wxData.errmsg }, 400)
      }
      openId = wxData.openid
      sessionKey = wxData.session_key
    }

    // 2. 查用户是否存在
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('wx_openid', openId)
      .single()

    if (!user) {
      // 3. 创建新用户
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          wx_openid: openId,
          nickname: '知友' + Math.random().toString(36).substring(2, 6).toUpperCase(),
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('创建用户失败:', error)
        return c.json({ code: 500, message: '创建用户失败' }, 500)
      }
      user = newUser
    }

    // 4. 生成 UserSig
    const userId = user.id
    const [userSig, expireTime] = generateUserSig(userId)

    return c.json({
      code: 0,
      data: {
        userId,
        openId,
        nickname: user.nickname,
        avatar: user.avatar,
        userSig,
        expireTime,
        timSdkAppId: config.tim.sdkAppId,
        isNewUser: !user.phone_hash // 是否未完善信息
      }
    })
  } catch (err) {
    console.error('登录失败:', err)
    return c.json({ code: 500, message: '服务器错误' }, 500)
  }
})

/**
 * 重新登录（使用缓存的userId，不需要wx.login）
 * POST /api/auth/relogin
 * Body: { userId }
 */
router.post('/relogin', async (c) => {
  try {
    const { userId } = await c.req.json()
    if (!userId) {
      return c.json({ code: 400, message: '缺少userId' }, 400)
    }

    // 查用户
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return c.json({ code: 404, message: '用户不存在' }, 404)
    }

    // 生成 UserSig
    const [userSig, expireTime] = generateUserSig(userId)

    return c.json({
      code: 0,
      data: {
        userId,
        openId: user.wx_openid,
        nickname: user.nickname,
        avatar: user.avatar,
        userSig,
        expireTime,
        timSdkAppId: config.tim.sdkAppId,
        isNewUser: !user.phone_hash
      }
    })
  } catch (err) {
    console.error('重新登录失败:', err)
    return c.json({ code: 500, message: '服务器错误' }, 500)
  }
})

export default router
