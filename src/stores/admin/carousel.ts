import request  from "@/utils/axios"
import {defineStore} from 'pinia'
import type { PageResult } from "../user/goods"

export interface CarouselDTO{
    id:number
    rank:number
    url:string
    redirectUrl:string
}

export interface CarouselPageDTO{
    pageNumber:number
    pageSize:number
}

export interface Carousel{
    id:number
    url?:string
    redirectUrl?:string
    rank?:number
}

export const useAdminCarousel=defineStore('adminCarousel',()=>{
    const getCarouselPage=async(carouselPageDTO:CarouselPageDTO):Promise<PageResult>=>{
        const res=await request.get('/admin/carousel/page',{params:carouselPageDTO})
        return res
    }
    const updateCarousel=async(carouselUpdateDTO:CarouselDTO)=>{
        await request.put('/admin/carousel',carouselUpdateDTO)
    }
    const insertCarousel=async(carouselDTO:CarouselDTO)=>{
        await request.post('/admin/carousel',carouselDTO)
    }
    const getCarouselById=async(id:number):Promise<Carousel>=>{
        const res=await request.get(`/admin/carousel/${id}`)
        return res
    }
    const deleteCarousel=async(ids:Array<number>)=>{
        await request.delete('/admin/carousel',{params:ids})
    }
    return{
        getCarouselById,
        getCarouselPage,
        updateCarousel,
        insertCarousel,
        deleteCarousel,
    }
})