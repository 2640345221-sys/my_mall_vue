import request  from "@/utils/axios"
import {defineStore} from 'pinia'
import type { Goods, PageResult } from "../user/goods"

export interface GoodsPageDTO{
    pageNumber:number
    pageSize:number
    goodsName?:string
    categoryId?:number
}

export const useAdminGoodsStore=defineStore('adminGoods',()=>{
    const insertGoods=async(goods:Goods)=>{
        await request.post('/admin/goods/save',goods)
    }
    const getGoodsById=async(id:number):Promise<Goods>=>{
        const res=await request.get(`/admin/goods/info/${id}`)
        return res
    }
    const pageGoods=async(goodsPageDTO:GoodsPageDTO):Promise<PageResult>=>{
        const res=await request.get('/admin/goods/page',{params:goodsPageDTO})
        return res
    }
    const updateSellStatus=async(sellStatus:number,ids:Array<number>)=>{
        await request.put(`/admin/goods/${sellStatus}`,ids)
    }
    const updateGoods=async(goods:Goods)=>{
        await request.post('/admin/goods/update',goods)
    }
    const deleteGoods=async(id:number)=>{
        await request.delete(`/admin/goods/${id}`)
    }

    return{
        deleteGoods,
        insertGoods,
        getGoodsById,
        pageGoods,
        updateGoods,
        updateSellStatus,
    }
})