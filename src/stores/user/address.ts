import request  from "@/utils/axios"
import {ref} from 'vue'
import {defineStore} from 'pinia'
export interface UserAddress{
    id:number
    userId?:number
    username:string
    userPhone?:string
    isDefault?:boolean
    province?:string
    city?:string
    region?:string
    detailAddress?:string
}

export const useAddressStore=defineStore('address',()=>{
    const defaultAddress=ref<UserAddress|null>(null)
    const allAddress=ref<Array<UserAddress>|null>(null)
    const addAddress=async(userAddressDTO:UserAddress)=>{
        await request.post('/user/address',userAddressDTO)
    }
    const getDefaultAddresss=async():Promise<UserAddress>=>{
        const res=await request.get('/user/address/default')
        defaultAddress.value=res
        return res
    }
    const deleteAddress=async(addressId:number)=>{
        await request.delete(`/user/address/${addressId}`)
    }
    const updateAddress=async(userAddressDTO:UserAddress)=>{
        await request.put('/user/address',userAddressDTO)
    }
    const getAllAddress=async():Promise<Array<UserAddress>>=>{
        const res=await request.get('/user/address')
        allAddress.value=res
        return res
    }

    const getById=async(addressId:number):Promise<UserAddress>=>{
        return await request.get(`/user/address/${addressId}`)
    }

    return{
        allAddress,
        defaultAddress,
        updateAddress,
        getAllAddress,
        addAddress,
        deleteAddress,
        getDefaultAddresss,
        getById,
    }
})