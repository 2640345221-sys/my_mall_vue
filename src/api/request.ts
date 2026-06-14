import axios, { type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(
  (config) => {
    const url = config.url || ''
    if (url.startsWith('/admin')) {
      const adminToken = localStorage.getItem('adminToken')
      if (adminToken) {
        config.headers.token = `${adminToken}`
      }
    } else {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.token = `${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    if (res.code !== 1) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
    return res.data
  },
  (error) => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request

// 类型声明：拦截器已解包 res.data，所有方法直接返回数据
declare module 'axios' {
  export interface AxiosInstance {
    <T = any>(config: any): Promise<T>
    request<T = any>(config: any): Promise<T>
    get<T = any>(url: string, config?: any): Promise<T>
    delete<T = any>(url: string, config?: any): Promise<T>
    head<T = any>(url: string, config?: any): Promise<T>
    options<T = any>(url: string, config?: any): Promise<T>
    post<T = any>(url: string, data?: any, config?: any): Promise<T>
    put<T = any>(url: string, data?: any, config?: any): Promise<T>
    patch<T = any>(url: string, data?: any, config?: any): Promise<T>
  }
}
