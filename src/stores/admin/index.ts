import request  from "@/utils/axios"
import {ref} from 'vue'
import {defineStore} from 'pinia'
import type { PageResult } from "../user/goods"

export interface IndexConfig{
    id:number
    name:string
    type?:number
    goodsId:number
    redirectUrl?:string
    rank?:number
}
export interface IndexConfigDTO{
    id:number
    name:string
    rank:number
    type:number
    goodsId:number
}

export interface IndexPageDTO{
    pageNumber:number
    pageSize:number
    type:number
}

export const useAdminIndexStore=defineStore('adminIndex',()=>{
    const indexConfig=async(indexPageDTO:IndexPageDTO):Promise<PageResult>=>{
        const res=await request.get('/admin/indexConfig',{params:indexPageDTO})
        return res
    }
    const getIndexConfigById=async(id:number):Promise<IndexConfig>=>{
        const res= await request.get(`/admin/indexConfig/${id}`)
        return res
    }
    const deleteIndexConfigById=async(ids:Array<number>)=>{
        await request.delete('/admin/indexConfig',{params:ids})
    }
    const updateIndexConfig=async(indexConfigDTO:IndexConfigDTO)=>{
        await request.put('/admin/indexConfig',indexConfigDTO)
    }
    const addIndexConfig=async(indexConfigDTO:IndexConfigDTO)=>{
        await request.post('/admin/indexConfig',indexConfigDTO)
    }
    return{
        indexConfig,
        getIndexConfigById,
        deleteIndexConfigById,
        updateIndexConfig,
        addIndexConfig,
    }
})