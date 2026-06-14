import request from '../request'

export interface GoodSCategory {
  id: number
  level?: number
  parentId?: number
  name: string
  rank?: number
}

export interface IndexCategoryVO {
  id: number
  level?: number
  name: string
  parentId?: number
  children?: IndexCategoryVO[]
}

export function getCategory(): Promise<IndexCategoryVO[]> {
  return request.get('/user/category')
}
