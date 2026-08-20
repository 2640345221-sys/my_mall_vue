import {defineStore} from 'pinia'
import {ref} from 'vue'
import request from '@/api/request'

export interface LoginParams{
    username:string
    password:string
}

export interface User{
    id:number
    nickName?:string
    loginName:string
    introduceSign?:string
    token?:string
    locked?:boolean
    createTime?:string
}

export interface UserDTO{
    nickName?:string
    loginName?:string
    introduceSign?:string
}



export const useUserStore=defineStore('user',()=>{
    const token =ref<string>(localStorage.getItem('token')||'')
    const userInfo=ref<User|null>(null)
    const doLogin=async(loginDTO:LoginParams): Promise<User>=>{
        const res = await request.post<User>('/user/login',loginDTO)
        const userToken=res.token||''
        token.value=userToken
        userInfo.value=res
        localStorage.setItem('token',userToken)
        return res
    }

    const getInfo=async():Promise<User>=>{
        const res=await request.get('/user/info')
        userInfo.value=res
        return res
    }
    const updateInfo=async(userDTO:UserDTO)=>{
        const res=await request.put('/user/info', userDTO)
        return res
    }
    const register=async(loginDTO:LoginParams)=>{
        return request.post('/user/register', loginDTO)
    }
    return {
        token,
        userInfo,
        doLogin,
        getInfo,
        updateInfo,
        register
    }
})
