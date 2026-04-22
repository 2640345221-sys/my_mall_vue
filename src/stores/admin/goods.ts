import request  from "@/utils/axios"
import {ref} from 'vue'
import {defineStore} from 'pinia'
import type { Goods, PageResult } from "../user/goods"

export interface GoodsPageDTO{
    pageNumber:number
    pageSize:number
    sellStatus:number
    goodsName:string
}

export const useAdminGoodsSotre=defineStore('adminGoods',()=>{
    const insertGoods=async(goods:Goods)=>{
        await request.post('/admin/goods',goods)
    }
    const getGoodsById=async(id:number):Promise<Goods>=>{
        const res=await request.get(`/admin/goods/${id}`)
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
        await request.put('/admin/goods',goods)
    }

    return{
        insertGoods,
        getGoodsById,
        pageGoods,
        updateGoods,
        updateSellStatus,
    }
})