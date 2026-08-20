import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/api/request'

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

  return {
    token,
    adminInfo,
    doLogin
  }
})
