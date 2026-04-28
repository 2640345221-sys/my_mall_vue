import {createRouter,createWebHistory} from 'vue-router'

const router =createRouter({
    history: createWebHistory(),
    routes:[
        // 用户端路由
        {
            path:'/',
            redirect:'/home'
        },
        {
            path:'/home',
            name:'Home',
            component:()=>import('@/views/user/Home.vue')
        },
        {
            path:'/login',
            name:'Login',
            component:()=>import('@/views/user/Login.vue')
        },
        {
            path:'/register',
            name:'Register',
            component:()=>import('@/views/user/Login.vue')
        },
        {
            path:'/category',
            name:'Category',
            component:()=>import('@/views/user/Category.vue')
        },
        {
            path:'/goods/:id',
            name:'GoodsDetail',
            component:()=>import('@/views/user/GoodsDetail.vue')
        },
        {
            path:'/goods-search',
            name:'GoodsSearch',
            component:()=>import('@/views/user/GoodsSearch.vue')
        },
        {
            path:'/cart',
            name:'Cart',
            component:()=>import('@/views/user/Cart.vue')
        },
        {
            path:'/order',
            name:'Order',
            component:()=>import('@/views/user/Order.vue')
        },
        {
            path:'/order/:orderNo',
            name:'OrderDetail',
            component:()=>import('@/views/user/OrderDetail.vue')
        },
        {
            path:'/create-order',
            name:'CreateOrder',
            component:()=>import('@/views/user/CreateOrder.vue')
        },
        {
            path:'/address',
            name:'Address',
            component:()=>import('@/views/user/Address.vue')
        },
        {
            path:'/address-edit',
            name:'AddressEdit',
            component:()=>import('@/views/user/AddressEdit.vue')
        },
        {
            path:'/user',
            name:'User',
            component:()=>import('@/views/user/User.vue')
        },
        {
            path:'/user/setting',
            name:'Setting',
            component:()=>import('@/views/user/Setting.vue')
        },
        {
            path:'/about',
            name:'About',
            component:()=>import('@/views/user/About.vue')
        },
        // 管理端路由
        {
            path:'/admin/login',
            name:'AdminLogin',
            component:()=>import('@/views/admin/Login.vue')
        },
        {
            path:'/admin',
            redirect:'/admin/goods'
        },
        {
            path:'/admin/goods',
            name:'AdminGoods',
            component:()=>import('@/views/admin/GoodsManage.vue')
        },
        {
            path:'/admin/order',
            name:'AdminOrder',
            component:()=>import('@/views/admin/OrderManage.vue')
        },
        {
            path:'/admin/user',
            name:'AdminUser',
            component:()=>import('@/views/admin/UserManage.vue')
        },
        {
            path:'/admin/category',
            name:'AdminCategory',
            component:()=>import('@/views/admin/CategoryManage.vue')
        },
        {
            path:'/admin/index-config',
            name:'AdminIndexConfig',
            component:()=>import('@/views/admin/IndexConfigManage.vue')
        },

    ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const adminToken = localStorage.getItem('adminToken')
    
    // 管理端需要登录
    if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
        if (!adminToken) {
            next('/admin/login')
            return
        }
    }
    
    // 用户端某些页面需要登录
    const needAuth = ['/cart', '/order', '/create-order', '/address', '/address-edit', '/user/setting']
    if (needAuth.some(path => to.path.startsWith(path)) && !token) {
        next('/login')
        return
    }
    
    next()
})

export default router
