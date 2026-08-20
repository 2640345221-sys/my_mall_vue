import request from '../request'
import type { PageResult } from '../user/goods'

export interface IndexPageDTO {
  pageNumber: number
  pageSize: number
  type?: number
}

export interface IndexConfigDTO {
  id?: number
  name: string
  rank: number
  type: number
  goodsId: number
}

export function getIndexConfigPage(indexPageDTO: IndexPageDTO): Promise<PageResult> {
  return request.get('/admin/indexConfig', { params: indexPageDTO })
}

export function deleteIndexConfig(ids: number[]) {
  return request.delete('/admin/indexConfig', { params: { ids } })
}

export function updateIndexConfig(indexConfigDTO: IndexConfigDTO) {
  return request.put('/admin/indexConfig', indexConfigDTO)
}

export function addIndexConfig(indexConfigDTO: IndexConfigDTO) {
  return request.post('/admin/indexConfig', indexConfigDTO)
}
