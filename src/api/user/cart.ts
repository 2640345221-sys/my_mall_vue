import request from '../request'
import type { PageResult } from './goods'

export interface CartItemDTO {
  goodsId: number
  goodsCount: number
}

export interface ShoppingCartDTO {
  cartItemId: number
  goodsCount: number
}

export interface ShoppingCartItemDTO {
  cartItemId: number
}

export function getCartPage(params: Record<string, any>): Promise<PageResult> {
  return request.get('/user/cart/page', { params })
}

export function addItem(data: CartItemDTO) {
  return request.post('/user/cart/add', data)
}

export function updateGoods(data: ShoppingCartDTO) {
  return request.put('/user/cart', data)
}

export function deleteGoods(cartItemId: number) {
  return request.delete(`/user/cart/${cartItemId}`)
}

export function getCartItem(params: ShoppingCartItemDTO) {
  return request.get('/user/cart', { params })
}
