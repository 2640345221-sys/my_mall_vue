import request  from "@/utils/axios"
import {ref} from 'vue'
import {defineStore} from 'pinia'

export interface Goods{
    goodsId:number
    goodsName:string
    goodsIntro?:string
    goodsCategoryId?:number
    goodsCoverImg?:string
    carousel?:Array<string>
    goodsDetailContent?:string
    originalPrice?:number
    sellingPrice?:number
    stockNum?:number
    tag?:string
    goodsSellStatus?:boolean
}
export interface PageResult{
    totalCount:number
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