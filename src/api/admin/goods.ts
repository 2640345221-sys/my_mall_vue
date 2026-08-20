import request from '../request'
import type { Goods, PageResult } from '../user/goods'

export interface GoodsPageDTO {
  pageNumber: number
  pageSize: number
  goodsName?: string
  categoryId?: number
}

export function insertGoods(goods: Goods) {
  return request.post('/admin/goods', goods)
}

export function pageGoods(goodsPageDTO: GoodsPageDTO): Promise<PageResult> {
  return request.get('/admin/goods/page', { params: goodsPageDTO })
}

export function updateSellStatus(sellStatus: number, ids: number[]) {
  return request.put(`/admin/goods/${sellStatus}`, ids)
}

export function updateGoods(goods: Goods) {
  return request.put('/admin/goods', goods)
}

export function deleteGoods(id: number) {
  return request.delete(`/admin/goods/${id}`)
}
