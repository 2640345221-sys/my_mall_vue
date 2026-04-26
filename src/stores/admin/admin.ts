import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/axios'

export interface AdminLoginParams {
  username: string
  password: string
}

export interface Admin {
  id: number
  nickName?: string
  loginName: string
  token?: string
}

export const useAdminStore = defineStore('admin', () => {
  const token = ref<string>(localStorage.getItem('adminToken') || '')
  const adminInfo = ref<Admin | null>(null)

  // 管理员登录
  const doLogin = async (loginDTO: AdminLoginParams): Promise<Admin> => {
    const data: any = await request.get('/admin/login', {
      params: loginDTO
    })
    const adminToken = data.token || ''
    token.value = adminToken
    adminInfo.value = {
      id: data.id,
      nickName: data.nickName,
      loginName: data.loginName,
      token: adminToken
    }
    localStorage.setItem('adminToken', adminToken)
    localStorage.setItem('adminInfo', JSON.stringify(adminInfo.value))
    return adminInfo.value
  }

  // 管理员登出
  const logout = async () => {
    try {
      await request.delete('/admin/logout')
    } catch (error) {
      console.error('登出请求失败', error)
    }
    token.value = ''
    adminInfo.value = null
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')
  }

  // 获取管理员信息
  const getInfo = async (): Promise<Admin> => {
    const data: any = await request.get('/admin/profile')
    adminInfo.value = {
      id: data.id,
      nickName: data.nickName,
      loginName: data.username
    }
    return adminInfo.value
  }

  // 从 localStorage 恢复登录状态
  const restoreLogin = () => {
    const savedToken = localStorage.getItem('adminToken')
    const savedInfo = localStorage.getItem('adminInfo')
    if (savedToken && savedInfo) {
      token.value = savedToken
      adminInfo.value = JSON.parse(savedInfo)
      return true
    }
    return false
  }

  return {
    token,
    adminInfo,
    doLogin,
    logout,
    getInfo,
    restoreLogin
  }
})
