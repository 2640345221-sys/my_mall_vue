import request from './request'

export function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/admin/common/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
