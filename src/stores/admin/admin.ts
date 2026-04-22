import request  from "@/utils/axios"
import {ref} from 'vue'
import {defineStore} from 'pinia'
import type { PageResult } from "../user/goods"
import type { LoginParams } from "../user/user"
import type {User} from'@/stores/user/user'

export interface AdminUpdateDTO{
    nickName:string
    password:string
    username:string
}

export interface Admin{
    id:number
    username:string
    password:string
    nickName?:string
    locked?:boolean
}
export interface AdminLoginResult{
    id?:number
    nickName?:string
    loginName?:string
    token?:string
}

export const useAdminUserStore=defineStore('admin',()=>{
    const adminToken=ref<string>(localStorage.getItem('adminToken')||'')
    const adminInfo=ref<AdminLoginResult|null>(null)
    const login=async(loginDTO:LoginParams):Promise<AdminLoginResult>=>{
        const res=await request.get('/admin/login',{params:loginDTO})
        const token=res.token||''
        adminToken.value=token
        adminInfo.value=res
        localStorage.setItem('adminToken',token)
        return res
    }
    const update=async(adminUpdateDTO:AdminUpdateDTO)=>{
        await request.put('/admin/update',adminUpdateDTO)
    }
    const getProfile=async():Promise<Admin>=>{
        const res=await request.get('/admin/profile')
        return res
    }
    const logout=async()=>{
        await request.delete('/admin/logout')
        localStorage.removeItem('adminToken')
        adminToken.value=''
        adminInfo.value=null
    }

    return{
        adminToken,
        adminInfo,
        login,
        getProfile,
        logout,
        update,
    }
})