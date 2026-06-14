import request from '../request'

export interface UserAddress {
  id?: number
  userId?: number
  username?: string
  userPhone?: string
  isDefault?: boolean
  province?: string
  city?: string
  region?: string
  detailAddress?: string
}

export function getAddressPage(params: Record<string, any>) {
  return request.get('/user/address/page', { params })
}

export function getById(id: number): Promise<UserAddress> {
  return request.get(`/user/address/${id}`)
}

export function getDefault(): Promise<UserAddress> {
  return request.get('/user/address/default')
}

export function addAddress(data: UserAddress) {
  return request.post('/user/address', data)
}

export function updateAddress(data: UserAddress) {
  return request.put('/user/address', data)
}

export function deleteById(id: number) {
  return request.delete(`/user/address/${id}`)
}

export function getAllAddress(): Promise<UserAddress[]> {
  return request.get('/user/address')
}
