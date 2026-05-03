import request  from "@/utils/axios"
import {defineStore} from 'pinia'
import type { PageResult } from "./goods"

export interface Order{
    id:number
    orderNo:string
    userId:number
    totalPrice:number
    payStatus:number
    payType:number
    orderStatus:number
    extraInfo:number
}
export interface OrderDTO{
    addressId:number
    cartItemIds:Array<number>
}
export interface OrderPayDTO{
    orderNo:string
    payType:number
}

export interface OrderItem{
    id:number
    orderId:number
    goodsId:number
    goodsName:string
    coverImg?:string
    price?:number
    count?:number
}
export interface OrderAddress{
    id:number
    username:string
    userPhone?:string
    province?:string
    city?:string
    region?:string
    detailAddress?:string
    orderId:number
}
export interface OrderDetailVO{
    id:number
    orderNo:string
    userId:number
    totalPrice?:number
    payStatus?:number
    payType?:number
    orderStatus?:number
    orderCartDTO?:Array<OrderCartDTO>
    orderAddress?:OrderAddress
}
export interface OrderPageDTO{
    pageNumber:number
    pageSize:number
    orderStatus:number
    orderNo:string
}
export interface OrderCartDTO{
    goodsId:number
    goodsName:string
    coverImg:string
    price:number
    count:number
}
export const useOrderStore=defineStore('order',()=>{
    const saveOrder=async(orderDTO:OrderDTO)=>{
        const res=await request.post('/user/order/saveOrder',orderDTO)
        return res
    }
    const cancelOrder=async(orderNo:string)=>{
        await request.put(`/user/order/${orderNo}/cancel`)
    }
    const confirmOrder=async(orderNo:string)=>{
        await request.put(`/user/order/${orderNo}/confirm`)
    }
    const getOrderDetail=async(orderNo:string):Promise<OrderDetailVO>=>{
        const res=await request.get(`/user/order/${orderNo}`)
        return res
    }
    const getOrderPage=async(orderPageDTO:OrderPageDTO):Promise<PageResult>=>{
        const res=await request.get('/user/order/page',{params:orderPageDTO})
        return res
    }
    const payOrder=async(orderpayDTO:OrderPayDTO)=>{
        await request.get('/user/order/paySuccess',{params:orderpayDTO})
    }
    return{
        saveOrder,
        cancelOrder,
        confirmOrder,
        getOrderDetail,
        getOrderPage,
        payOrder,
    }

})