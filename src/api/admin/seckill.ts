import request from '../request'

export function getPage(params: Record<string, any>) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') searchParams.append(k, String(v))
  })
  return request.get(`/admin/seckill/page?${searchParams.toString()}`)
}

export function save(data: Record<string, any>) {
  return request.post('/admin/seckill', data)
}

export function update(data: Record<string, any>) {
  return request.put('/admin/seckill', data)
}

export function deleteById(id: number) {
  return request.delete(`/admin/seckill/${id}`)
}

export function updateStatus(id: number, status: number) {
  return request.post(`/admin/seckill/status/${id}`, status, {
    headers: { 'Content-Type': 'application/json' }
  })
}
