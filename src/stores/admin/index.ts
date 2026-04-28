import request  from "@/utils/axios"
import {ref} from 'vue'
import {defineStore} from 'pinia'
import type { PageResult } from "../user/goods"



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

    return{
        indexConfig,

    }
})