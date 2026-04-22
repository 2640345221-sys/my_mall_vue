import request  from "@/utils/axios"
import {ref} from 'vue'
import {defineStore} from 'pinia'
export interface GoodSCategory{
    id:number
    level?:number
    parentId?:number
    name:string
    rank?:number
}

export interface IndexCategoryVO{
    id:number
    level?:string
    name:string
    parentId?:number
    children?:Array<IndexCategoryVO>
}

export const useCategoryStore=defineStore('category',()=>{
    const getCategory=async():Promise<Array<IndexCategoryVO>>=>{
        const res=await request.get('/user/category')
        return res
    }
    return{
        getCategory,
    }
})


