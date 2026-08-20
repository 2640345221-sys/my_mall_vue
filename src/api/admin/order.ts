import request from '../request'
import type { PageResult } from '../user/goods'
import type { OrderDetailVO, OrderPageDTO } from '../user/order'

export function getPage(orderPageDTO: OrderPageDTO): Promise<PageResult> {
  return request.get('/admin/order/page', { params: orderPageDTO })
}

export function getOrderDetail(orderNo: string): Promise<OrderDetailVO> {
  return request.get(`/admin/order/${orderNo}`)
}

export function checkDone(ids: number[]) {
  return request.put('/admin/order/checkDone', ids)
}

export function checkOut(ids: number[]) {
  return request.put('/admin/order/checkOut', ids)
}

export function close(ids: number[]) {
  return request.put('/admin/order/close', ids)
}
