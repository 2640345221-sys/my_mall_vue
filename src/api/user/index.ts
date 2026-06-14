import request from '../request'
import type { Goods } from './goods'

export function getNewGoods(): Promise<Goods[]> {
  return request.get('/user/index/new')
}

export function getPopularGoods(): Promise<Goods[]> {
  return request.get('/user/index/popular')
}

export function getRecommendGoods(): Promise<Goods[]> {
  return request.get('/user/index/recommend')
}
