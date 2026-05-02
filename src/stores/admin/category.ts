import request  from "@/utils/axios"
import {defineStore} from 'pinia'
import type { GoodSCategory } from "../user/category"

export interface CategoryDTO{
    id:number
    level?:number
    name:string
    rank?:number
    parentId?:number
}


export const useAdminCategoryStore=defineStore('adminCategory',()=>{
    const insertCategory=async(categoryInsertDTO:CategoryDTO)=>{
        await request.post('/admin/category',categoryInsertDTO)
    }
    const deleteCategory=async(ids:Array<number>)=>{
        await request.delete('/admin/category',{params:ids})
    }
    const updateCategory=async(categoryDTO:CategoryDTO)=>{
        await request.put('/admin/category',categoryDTO)
    }
    const getCategoryById=async(id:number):Promise<GoodSCategory>=>{
        const res=await request.get(`/admin/category/${id}`)
        return res
    }
    const getAll=async():Promise<Array<GoodSCategory>>=>{
        const res=await request.get('/admin/category')
        return res
    }
    return{
        insertCategory,
        deleteCategory,
        updateCategory,
        getCategoryById,
        getAll,

    }
})