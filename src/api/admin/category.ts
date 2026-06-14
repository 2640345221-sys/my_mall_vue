import request from '../request'
import type { GoodSCategory } from '../user/category'

export interface CategoryDTO {
  id: number
  level?: number
  name: string
  rank?: number
  parentId?: number
}

export function insertCategory(categoryInsertDTO: CategoryDTO) {
  return request.post('/admin/category', categoryInsertDTO)
}

export function deleteCategory(ids: number[]) {
  return request.delete('/admin/category', { params: { ids }, paramsSerializer: { indexes: null } })
}

export function updateCategory(categoryDTO: CategoryDTO) {
  return request.put('/admin/category', categoryDTO)
}

export function getCategoryById(id: number): Promise<GoodSCategory> {
  return request.get(`/admin/category/${id}`)
}

export function getAll(): Promise<GoodSCategory[]> {
  return request.get('/admin/category')
}
