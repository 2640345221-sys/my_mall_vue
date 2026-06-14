import request from '../request'
import type { PageResult } from './goods'

export interface OrderDTO {
  addressId: number
  cartItemIds: number[]
}

export interface OrderPayDTO {
  orderNo: string
  payType: number
}

export interface OrderDetailVO {
  id?: number
  orderNo: string
  userId: number
  totalPrice?: number
  payStatus?: number
  payType?: number
  orderStatus?: number
  payTime?: string
  createTime?: string
  orderCartDTO?: OrderCartDTO[]
  orderAddress?: {
    username?: string
    userPhone?: string
    province?: string
    city?: string
    region?: string
    detailAddress?: string
  }
}

export interface OrderPageDTO {
  pageNumber: number
  pageSize: number
  orderStatus: number
  orderNo: string
}

export interface OrderCartDTO {
  goodsId: number
  goodsName: string
  coverImg: string
  price: number
  count: number
}

export function createOrder(orderDTO: OrderDTO) {
  return request.post('/user/order/saveOrder', orderDTO)
}

export function getOrderPage(params: Record<string, any>): Promise<PageResult> {
  return request.get('/user/order/page', { params })
}

export function getById(orderNo: string): Promise<OrderDetailVO> {
  return request.get(`/user/order/${orderNo}`)
}

export function payOrder(data: OrderPayDTO) {
  return request.post('/user/order/paySuccess', data)
}

export function confirmOrder(orderNo: string) {
  return request.put(`/user/order/${orderNo}/confirm`)
}

export function cancelOrder(orderNo: string) {
  return request.put(`/user/order/${orderNo}/cancel`)
}
