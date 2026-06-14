import request from '../request'
import type { PageResult } from '../user/goods'

export interface UserPageDTO {
  pageNumber: number
  pageSize: number
  locked: number
}

export function page(userPageDTO: UserPageDTO): Promise<PageResult> {
  return request.get('/admin/user', { params: userPageDTO })
}

export function setStatus(lockStatus: number, ids: number[]) {
  return request.put(`/admin/user/${lockStatus}`, ids)
}
