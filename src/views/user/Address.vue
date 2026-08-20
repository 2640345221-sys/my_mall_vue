<template>
  <div class="address-container">
    <PageHeader title="地址管理" :topOffset="44" @back="goBack" />

    
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
            <span class="name">{{ item.username }}</span>
            <span class="phone">{{ item.userPhone }}</span>
            <el-tag v-if="item.isDefault" type="danger" size="small" class="default-tag">默认</el-tag>
          </div>
          <div class="item-address">
            {{ item.province }} {{ item.city }} {{ item.region }} {{ item.detailAddress }}
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

    
    <div class="empty-state" v-else>
      <el-empty description="暂无收货地址">
        <el-button type="primary" @click="handleAdd">添加地址</el-button>
      </el-empty>
    </div>

    
    <div class="bottom-bar">
      <el-button type="primary" size="large" @click="handleAdd" :icon="Plus">
        新建地址
      </el-button>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus } from '@element-plus/icons-vue'
import { getAllAddress, deleteById } from '@/api/user/address'
import PageHeader from '@/components/PageHeader.vue'
import BottomNav from '@/components/BottomNav.vue'

const route = useRoute()
const router = useRouter()

const state = reactive({
  list: [] as Array<any>,
  selectedId: null as number | null,
  from: ''
})

const init = async () => {
  state.from = (route.query.from as string) || ''
  
  await loadAddressList()
}

const loadAddressList = async () => {
  try {
    const res = await getAllAddress()
    state.list = res || []
    
    const defaultAddress = state.list.find((item: any) => item.isDefault)
    if (defaultAddress) {
      state.selectedId = defaultAddress.id
    }
  } catch (error) {
    ElMessage.error('加载地址失败')
    console.error(error)
  }
}

const goBack = () => {
  if (state.from === 'create-order') {
    router.back()
  } else {
    router.push('/user')
  }
}

const handleSelect = (item: any) => {
  if (state.from === 'create-order') {
    router.push({
      path: '/create-order',
      query: {
        addressId: item.id,
        cartItemIds: route.query.cartItemIds
      }
    })
  } else {
    state.selectedId = item.id
  }
}

const handleAdd = () => {
  router.push({
    path: '/address-edit',
    query: {
      type: 'add',
      from: state.from
    }
  })
}

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

const handleDelete = async (item: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteById(item.id)
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
  padding-top: 44px;
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
  padding-top: 0;
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
