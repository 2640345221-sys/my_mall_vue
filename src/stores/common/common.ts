// stores/admin/common.ts
import request from '@/utils/axios'
import { defineStore } from 'pinia'

export const useCommonStore = defineStore('common', () => {
    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData()
        formData.append('file', file)
        
        const res = await request.post('/admin/common/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'  
            }
        })
        return res 
    }

    return {
        uploadFile
    }
})