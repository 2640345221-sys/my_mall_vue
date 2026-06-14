import request from '../request'

export interface Goods {
  id: number
  name: string
  intro?: string
  categoryId?: number
  coverImg?: string
  detailContent?: string
  originalPrice?: number
  sellingPrice?: number
  stockNum?: number
  sellStatus?: boolean
}

export interface PageResult {
  total: number
  totalPage: number
  records?: any[]
}

export function getGoodsById(id: number): Promise<Goods> {
  return request.get(`/user/goods/detail/${id}`)
}

export function search(params: Record<string, any>): Promise<PageResult> {
  return request.get('/user/goods/search', { params })
}
