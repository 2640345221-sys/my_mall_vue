<template>
  <div class="cart-container">
    <PageHeader title="购物车" :showBack="false" :topOffset="44">
      <template #right>
        <el-icon @click="goToHome" style="cursor:pointer"><HomeFilled /></el-icon>
      </template>
    </PageHeader>

    <div class="search-box">
      <el-icon><Search /></el-icon>
      <input v-model="state.keyword" placeholder="搜索购物车商品" />
    </div>


    <div class="cart-content" v-if="state.list.length > 0">

      <div class="cart-list" v-if="filteredList.length > 0">
        <div
          class="cart-item"
          v-for="item in filteredList"
          :key="item.cartItemId"
        >
          <el-checkbox v-model="item.checked" @change="handleItemChange" />
          
          <div class="item-img" @click="goToDetail(item.goodsId)">
            <img :src="item.coverImg" :alt="item.goodsName" />
          </div>
          
          <div class="item-info">
            <div class="item-name" @click="goToDetail(item.goodsId)">
              {{ item.goodsName }}
            </div>
            <div class="item-price">¥{{ formatPrice(item.sellingPrice) }}</div>
            <div class="item-actions">
              <el-input-number
                v-model="item.goodsCount"
                :min="1"
                :max="99"
                size="small"
                @change="(val:any) => handleCountChange(val, item)"
              />
              <el-button
                type="danger"
                link
                size="small"
                @click="handleDelete(item.cartItemId)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div class="empty-cart" v-else>
      <el-empty description="购物车空空如也">
        <el-button type="primary" @click="goToHome">去购物</el-button>
      </el-empty>
    </div>

    
    <div class="cart-footer" v-if="state.list.length > 0">
      <div class="footer-left">
        <el-checkbox v-model="state.checkAll" @change="handleCheckAll">
          全选
        </el-checkbox>
        <span class="total-text">
          合计: <span class="total-price">¥{{ formatPrice(totalPrice) }}</span>
        </span>
      </div>
      <div class="footer-right">
        <el-button type="danger" size="large" @click="handleCheckout">
          结算({{ checkedCount }})
        </el-button>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { HomeFilled, Search } from '@element-plus/icons-vue'
import BottomNav from '@/components/BottomNav.vue'
import { getCartPage, updateGoods, deleteGoods } from '@/api/user/cart'
import { formatPrice } from '@/utils/format'
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()

const state = reactive({
  list: [] as Array<any>,
  keyword: '',
  checkAll: false,
  loading: false
})

const filteredList = computed(() => {
  const kw = state.keyword.trim().toLowerCase()
  if (!kw) return state.list
  return state.list.filter(item => (item.goodsName || '').toLowerCase().includes(kw))
})

const totalPrice = computed(() => {
  return state.list
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.sellingPrice * item.goodsCount, 0)
    .toFixed(2)
})

const checkedCount = computed(() => {
  return state.list.filter(item => item.checked).length
})

const loadCartData = async () => {
  state.loading = true
  try {
    const res = await getCartPage({
      pageNumber: 1,
      pageSize: 100
    })
    state.list = (res.records || []).map((item: any) => ({
      ...item,
      checked: false
    }))
    state.checkAll = false
  } catch (error) {
    ElMessage.error('加载购物车失败')
    console.error(error)
  } finally {
    state.loading = false
  }
}

const goToHome = () => {
  router.push('/home')
}

const goToDetail = (goodsId?: number) => {
  if (goodsId) {
    router.push(`/goods/${goodsId}`)
  }
}

const handleCountChange = async (value: number, item: any) => {
  if (!item.cartItemId) return
  
  try {
    await updateGoods({
      cartItemId: item.cartItemId,
      goodsCount: value
    })
    ElMessage.success('更新成功')
  } catch (error) {
    ElMessage.error('更新失败')
    loadCartData()
  }
}

const handleDelete = async (id?: number) => {
  if (!id) return
  
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteGoods(id)
    ElMessage.success('删除成功')
    loadCartData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleItemChange = () => {
  const allChecked = state.list.length > 0 && state.list.every(item => item.checked)
  state.checkAll = allChecked
}

const handleCheckAll = (val: boolean) => {
  state.list.forEach(item => {
    item.checked = val
  })
}

const handleCheckout = () => {
  const checkedItems = state.list.filter(item => item.checked)
  if (checkedItems.length === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  
  const cartItemIds = checkedItems.map(item => item.cartItemId)
  router.push({
    path: '/create-order',
    query: { cartItemIds: JSON.stringify(cartItemIds) }
  })
}

onMounted(() => {
  loadCartData()
})
</script>

<style scoped>
.cart-container {
  min-height: 100vh;
  background: var(--bg-warm);
  padding-top: 44px;
  padding-bottom: 80px;
}

.search-box { display: flex; align-items: center; gap: 8px; margin: 10px 12px; padding: 8px 12px; background: var(--card); border-radius: 18px; color: var(--text-muted); box-shadow: var(--shadow-sm); }
.search-box input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; color: var(--text); }

.cart-content { padding-top: 0; }

.cart-list {
  margin: 12px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 14px 12px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.cart-item:last-child { border-bottom: none; border-radius: 0 0 var(--radius-lg) var(--radius-lg); }
.cart-item:first-child { border-radius: var(--radius-lg) var(--radius-lg) 0 0; }

.item-img {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin: 0 12px;
  flex-shrink: 0;
}

.item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info { flex: 1; min-width: 0; }

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--price-red);
  margin-bottom: 8px;
  font-family: var(--font-display);
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.empty-cart { padding-top: 120px; }

.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  background: var(--card);
  border-top: 1px solid var(--border);
  z-index: 1000;
  box-shadow: 0 -2px 16px rgba(0,0,0,0.04);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.total-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--price-red);
  font-family: var(--font-display);
}
.total-price::before { content: '合计 ¥'; font-size: 13px; font-weight: 500; color: var(--text-muted); margin-right: 4px; }
</style>

