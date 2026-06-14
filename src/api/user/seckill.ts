import request from '../request'

export function getSeckillList() {
  return request.get('/user/seckillOrder/list')
}

export function submitSeckill(data: Record<string, any>) {
  return request.post('/user/seckillOrder', data)
}

export function getResult(seckillGoodsId: number) {
  return request.get(`/user/seckillOrder/result?id=${seckillGoodsId}`)
}
