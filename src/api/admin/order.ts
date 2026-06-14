import request from '../request'
import type { PageResult } from '../user/goods'
import type { OrderDetailVO, OrderPageDTO } from '../user/order'

export interface OrderPayDTO {
  orderNo: string
  payType: number
}

export function getPage(orderPageDTO: OrderPageDTO): Promise<PageResult> {
  return request.get('/admin/order/page', { params: orderPageDTO })
}

export function getOrder(orderNo: string): Promise<OrderDetailVO> {
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

export function paySuccess(orderPayDTO: OrderPayDTO) {
  return request.post('/admin/order/paySuccess', orderPayDTO)
}

export function getOrderDetail(orderNo: string): Promise<OrderDetailVO> {
  return request.get(`/admin/orders/${orderNo}`)
}

export function shipOrder(shipForm: { orderNo: string; company: string; trackingNo: string }) {
  return request.post('/admin/orders/ship', shipForm)
}

export function cancelByOrderNo(orderNo: string) {
  return request.put(`/admin/orders/cancel/${orderNo}`)
}
