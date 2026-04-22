import request  from "@/utils/axios"
import {ref} from 'vue'
import {defineStore} from 'pinia'
import type { PageResult } from "../user/goods"

export interface UserPageDTO{
    pageNumber:number
    pageSize:number
    locked:number
}
export const useAdminUserStore=defineStore('adminUser',()=>{
    const page=async(userPageDTO:UserPageDTO):Promise<PageResult>=>{
        const res=await request.get('/admin/user',{params:userPageDTO})
        return res
    }
    const setStatus=async(lockStatus:number,ids:Array<number>)=>{
        await request.put(`/admin/user/${lockStatus}`)
    }
    return{
        page,
        setStatus,
    }
})


