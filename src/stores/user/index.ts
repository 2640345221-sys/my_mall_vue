import request from '@/utils/axios'
import { defineStore } from 'pinia'
import type { Goods } from './goods'

export interface Carousel {
    id?: number
    url?: string
    redirectUrl?: string
    rank?: number
}

export const useIndexStore = defineStore('index', () => {
    // 获取轮播图
    const getCarousel = async (): Promise<Array<Carousel>> => {
        const res = await request.get('/user/index/carousel')
        return res
    }

    // 获取新品商品
    const getNewGoods = async (): Promise<Array<Goods>> => {
        const res = await request.get('/user/index/new')
        return res
    }

    // 获取热门商品
    const getPopularGoods = async (): Promise<Array<Goods>> => {
        const res = await request.get('/user/index/popular')
        return res
    }

    // 获取推荐商品
    const getRecommendGoods = async (): Promise<Array<Goods>> => {
        const res = await request.get('/user/index/recommend')
        return res
    }

    return {
        getCarousel,
        getNewGoods,
        getPopularGoods,
        getRecommendGoods
    }
})
