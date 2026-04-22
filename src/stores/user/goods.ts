import request  from "@/utils/axios"
import {ref} from 'vue'
import {defineStore} from 'pinia'

export interface Goods{
    id:number
    name:string
    intro?:string
    categoryId?:number
    coverImg?:string
    carousel?:Array<string>
    detailContent?:string
    originalPrice?:number
    sellingPrice?:number
    stockNum?:number
    tag?:string
    sellStatus?:boolean
}
export interface PageResult{
    total:number
    totalPage:number
    records?:Array<any>
}
export interface PageDTO{
    keyword?:string
    categoryId?:number
    orderBy?:string
    pageNumber:number
    pageSize:number
}

export const useGoodsStore=defineStore('goods',()=>{
    const goodsDetail=ref<Goods|null>(null)
    const goodsSearchResult=ref<PageResult|null>(null)
    const getGoodsById=async(param:number):Promise<Goods>=>{
        const res=await request.get(`/user/goods/detail/${param}`)
        goodsDetail.value=res
        return res
    }
    const search=async(param:PageDTO):Promise<PageResult> =>{
        const res=await request.get('/user/goods/search',{params:param})
        goodsSearchResult.value=res
        return res
    }

    return{
        goodsDetail,
        goodsSearchResult,

        getGoodsById,
        search,
    }
})