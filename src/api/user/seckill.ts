import request from '../request'

//活动中的秒杀商品列表
export function getSeckillGoodsList() {
  return request.get('/user/seckill/list')
}

//当前用户的秒杀订单列表
export function getMySeckillOrders(params?: Record<string, any>) {
  return request.get('/user/seckillOrder/list', { params })
}

export function submitSeckill(data: Record<string, any>) {
  return request.post('/user/seckillOrder', data)
}

export function getResult(seckillGoodsId: number) {
  return request.get(`/user/seckillOrder/result?id=${seckillGoodsId}`)
}
