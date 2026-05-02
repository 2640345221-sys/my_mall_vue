import request  from "@/utils/axios"
import {defineStore} from 'pinia'
import type { PageResult } from "../user/goods"

// 分页查询参数接口
export interface IndexPageDTO{
    pageNumber:number
    pageSize:number
    type?:number
}

// 首页配置DTO接口
export interface IndexConfigDTO{
    id?: number
    name: string
    rank: number
    type: number
    goodsId: number
}

export const useAdminIndexStore=defineStore('adminIndex',()=>{
    // 分页查询首页配置
    const getIndexConfigPage=async(indexPageDTO:IndexPageDTO):Promise<PageResult>=>{
        const res=await request.get('/admin/indexConfig',{params:indexPageDTO})
        return res
    }
    
    // 根据ID查询首页配置
    const getIndexConfigById=async(id:number):Promise<IndexConfigDTO>=>{
        const res=await request.get(`/admin/indexConfig/${id}`)
        return res
    }
    
    // 批量删除首页配置
    const deleteIndexConfig=async(ids:Array<number>)=>{
        await request.delete('/admin/indexConfig',{params:{ids}})
    }
    
    // 更新首页配置
    const updateIndexConfig=async(indexConfigDTO:IndexConfigDTO)=>{
        await request.put('/admin/indexConfig',indexConfigDTO)
    }
    
    // 新增首页配置
    const addIndexConfig=async(indexConfigDTO:IndexConfigDTO)=>{
        await request.post('/admin/indexConfig',indexConfigDTO)
    }

    return{
        getIndexConfigPage,
        getIndexConfigById,
        deleteIndexConfig,
        updateIndexConfig,
        addIndexConfig
    }
})