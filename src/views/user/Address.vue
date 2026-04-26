<template>
  <div class="address-container">
    <!-- 顶部导航 -->
    <header class="address-header">
      <div class="header-left" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">地址管理</div>
      <div class="header-right"></div>
    </header>

    <!-- 地址列表 -->
    <div class="address-list" v-if="state.list.length > 0">
      <div
        class="address-item"
        v-for="item in state.list"
        :key="item.id"
        :class="{ 'active': state.selectedId === item.id }"
        @click="handleSelect(item)"
      >
        <div class="item-content">
          <div class="item-header">
            <span class="name">{{ item.userName }}</span>
            <span class="phone">{{ item.userPhone }}</span>
            <el-tag v-if="item.defaultFlag" type="danger" size="small" class="default-tag">默认</el-tag>
          </div>
          <div class="item-address">
            {{ item.provinceName }} {{ item.cityName }} {{ item.regionName }} {{ item.detailAddress }}
          </div>
        </div>
        <div class="item-actions">
          <el-button type="primary" link @click.stop="handleEdit(item)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button type="danger" link @click.stop="handleDelete(item)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <el-empty description="暂无收货地址">
        <el-button type="primary" @click="handleAdd">添加地址</el-button>
      </el-empty>
    </div>

    <!-- 底部添加按钮 -->
    <div class="bottom-bar">
      <el-button type="primary" size="large" @click="handleAdd" :icon="Plus">
        新建地址
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit, Delete, Plus } from '@element-plus/icons-vue'
import { useAddressStore } from '@/stores/user/address'

const route = useRoute()
const router = useRouter()
const addressStore = useAddressStore()

const state = reactive({
  list: [] as Array<any>,
  selectedId: null as number | null,
  from: ''
})

// 初始化
const init = async () => {
  // 获取来源页面
  state.from = (route.query.from as string) || ''
  
  // 加载地址列表
  await loadAddressList()
}

// 加载地址列表
const loadAddressList = async () => {
  try {
    const res = await addressStore.getAddressPage({
      pageNumber: 1,
      pageSize: 100
    })
    state.list = res.records || []
    
    // 如果有默认地址，选中它
    const defaultAddress = state.list.find((item: any) => item.defaultFlag)
    if (defaultAddress) {
      state.selectedId = defaultAddress.id
    }
  } catch (error) {
    ElMessage.error('加载地址失败')
    console.error(error)
  }
}

// 返回上一页
const goBack = () => {
  if (state.from === 'create-order') {
    router.back()
  } else {
    router.push('/user')
  }
}

// 选择地址（从创建订单页面进入时）
const handleSelect = (item: any) => {
  if (state.from === 'create-order') {
    // 返回创建订单页面，传递选中的地址ID
    router.push({
      path: '/create-order',
      query: {
        addressId: item.id,
        cartItemIds: route.query.cartItemIds
      }
    })
  } else {
    // 只是选中，不跳转
    state.selectedId = item.id
  }
}

// 添加地址
const handleAdd = () => {
  router.push({
    path: '/address-edit',
    query: {
      type: 'add',
      from: state.from
    }
  })
}

// 编辑地址
const handleEdit = (item: any) => {
  router.push({
    path: '/address-edit',
    query: {
      type: 'edit',
      addressId: item.id,
      from: state.from
    }
  })
}

// 删除地址
const handleDelete = async (item: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await addressStore.deleteById(item.id)
    ElMessage.success('删除成功')
    loadAddressList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.address-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.address-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: white;
  z-index: 1000;
  border-bottom: 1px solid #eee;
}

.header-left {
  font-size: 20px;
  color: #666;
}

.header-title {
  font-size: 16px;
}

.address-list {
  padding-top: 50px;
}

.address-item {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
}

.address-item.active {
  background-color: #f0f9ff;
  border-left: 3px solid #1baeae;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.name {
  font-size: 16px;
  color: #333;
}

.phone {
  font-size: 14px;
  color: #666;
}

.item-address {
  font-size: 14px;
  color: #333;
}

.item-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.empty-state {
  padding-top: 100px;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 15px;
  background: white;
  border-top: 1px solid #eee;
  z-index: 1000;
}

.bottom-bar .el-button {
  width: 100%;
}
</style>
