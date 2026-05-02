import request  from "@/utils/axios"
import {defineStore} from 'pinia'
import type { PageResult } from "../user/goods"
import type { OrderDetailVO, OrderPageDTO } from "../user/order"

export const useAdminOrderStore=defineStore('adminOrder',()=>{
    const getPage=async(orderPageDTO:OrderPageDTO):Promise<PageResult>=>{
        const res=await request.get('/admin/order/page',{params:orderPageDTO})
        return res
    }
    const getOrder=async(orderNo:string):Promise<OrderDetailVO>=>{
        const res=await request.get(`/admin/order/${orderNo}`)
        return res
    }
    const checkDone=async(ids:Array<number>)=>{
        await request.put('/admin/order/checkDone',ids)
    }
    const checkOut=async(ids:Array<number>)=>{
        await request.put('/admin/order/checkOut',ids)
    }
    const close=async(ids:Array<number>)=>{
        await request.put('/admin/order/close',ids)
    }

    return{
        getPage,
        getOrder,
        checkDone,
        checkOut,
        close,
    }
})