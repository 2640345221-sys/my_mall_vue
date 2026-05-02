import request  from "@/utils/axios"
import {ref} from 'vue'
import {defineStore} from 'pinia'
import type { PageResult } from "./goods"

export interface ShoppingCart{
    id:number
    userId:number
    goodsId:number
    goodsCount?:number
}

export interface CartItemDTO{
    goodsId:number
    goodsCount:number
}

export interface ShoppingCartPageDTO{
    pageSize:number
    pageNumber:number
}

export interface ShoppingCartItemVO{
    cartItemId:number
    goodsCount:number
    coverImg?:string
    goodsId:number
    goodsName:string
    sellingPrice?:number
}
export interface ShoppingCartDTO{
    cartItemId:number
    goodsCount:number
}

export interface ShoppingCartItemDTO{
    cartItemId:number
}

export const useShoppingCartStore=defineStore('shoppingcart',()=>{
    const shoppingCartPage=ref<PageResult|null>(null)
    const addItem=async(cartItemDTO:CartItemDTO)=>{
        return await request.post('/user/cart/add',cartItemDTO)
    }

    const pageResult=async(pageDTO:ShoppingCartPageDTO)=>{
        const res=await request.get('/user/cart/page',{params:pageDTO})
        shoppingCartPage.value=res
        return res
    }
    
    const updateGoods=async(shoppingCartDTO:ShoppingCartDTO)=>{
        return await request.put('/user/cart',shoppingCartDTO)
    }
    
    const deleteGoods=async(cartItemId:number)=>{
        return await request.delete(`/user/cart/${cartItemId}`)
    }
    
    const getCartItem=async(cartItemDTO:ShoppingCartItemDTO):Promise<ShoppingCartItemVO>=>{
        return await request.get('/user/cart',{params:cartItemDTO})
    }



    return{
        shoppingCartPage,
        addItem,
        deleteGoods,
        getCartItem,
        pageResult,
        updateGoods,
    }
})