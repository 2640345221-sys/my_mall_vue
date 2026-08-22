<template>
  <div class="seckill-container">
    <PageHeader title="限时秒杀" :topOffset="44" @back="$router.back()" />

    <div class="search-box">
      <el-icon><Search /></el-icon>
      <input v-model="state.keyword" placeholder="搜索秒杀商品" />
    </div>

    <div class="seckill-list" v-if="filteredList.length > 0">
      <div class="seckill-item" v-for="item in filteredList" :key="item.id">
        <img :src="item.coverImg" :alt="item.goodsName" />
        <div class="seckill-info">
          <div class="goods-name">{{ item.goodsName }}</div>
          <div class="price-row">
            <span class="seckill-price">¥{{ formatPrice(item.seckillPrice) }}</span>
            <span class="original-price">¥{{ formatPrice(item.originalPrice) }}</span>
          </div>
          <div class="stock">剩余 {{ item.stockCount }} 件</div>
        </div>
        <el-button type="danger" size="small" @click="handleBuy(item)" :disabled="item.stockCount <= 0">
          {{ item.stockCount > 0 ? '立即秒杀' : '已售罄' }}
        </el-button>
      </div>
    </div>
    <el-empty v-else description="暂无秒杀活动" />

    
    <el-dialog v-model="state.buyVisible" title="确认秒杀" width="90%">
      <div class="buy-info" v-if="state.currentItem">
        <p>商品：{{ state.currentItem.goodsName }}</p>
        <p>秒杀价：¥{{ formatPrice(state.currentItem.seckillPrice) }}</p>
        <el-form-item label="数量">
          <el-input-number v-model="state.buyCount" :min="1" :max="state.currentItem.stockCount" />
        </el-form-item>
      </div>
      <template #footer>
        <el-button @click="state.buyVisible = false">取消</el-button>
        <el-button type="danger" @click="submitSeckill" :loading="state.submitting">确认秒杀</el-button>
      </template>
    </el-dialog>

    
    <el-dialog v-model="state.resultVisible" title="秒杀结果" width="85%" :close-on-click-modal="false">
      <div class="result-box">
        <el-result
          v-if="state.resultStatus === 'success'"
          icon="success"
          title="秒杀成功！"
          sub-title="订单正在处理中，请稍后查看"
        />
        <el-result
          v-else-if="state.resultStatus === 'fail'"
          icon="error"
          title="秒杀失败"
          :sub-title="state.resultMsg"
        />
        <div v-else class="polling-box">
          <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
          <p>正在处理中，请稍候...</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="state.resultVisible = false" v-if="state.resultStatus">关闭</el-button>
      </template>
    </el-dialog>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, Search } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import BottomNav from '@/components/BottomNav.vue'
import { getSeckillGoodsList, submitSeckill as submitSeckillApi, getResult } from '@/api/user/seckill'
import { getDefault } from '@/api/user/address'
import { useUserStore } from '@/stores/user/user'
import { formatPrice } from '@/utils/format'

const userStore = useUserStore()

const pollingTimer = ref<ReturnType<typeof setInterval> | null>(null)

const state = reactive({
  list: [] as any[],
  keyword: '',
  buyVisible: false,
  currentItem: null as any,
  buyCount: 1,
  submitting: false,
  resultVisible: false,
  resultStatus: '' as string,
  resultMsg: ''
})

const filteredList = computed(() => {
  const kw = state.keyword.trim().toLowerCase()
  if (!kw) return state.list
  return state.list.filter(item => (item.goodsName || '').toLowerCase().includes(kw))
})

const loadList = async () => {
  try {
    const res = await getSeckillGoodsList()
    state.list = res || []
  } catch { ElMessage.error('加载秒杀列表失败') }
}

const handleBuy = (item: any) => {
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    return
  }
  state.currentItem = item
  state.buyCount = 1
  state.buyVisible = true
}

const submitSeckill = async () => {
  state.submitting = true
  try {
    // 获取默认收货地址，没有则提示先设置
    const address = await getDefault()
    if (!address || !address.id) {
      ElMessage.warning('请先设置收货地址')
      return
    }
    await submitSeckillApi({
      seckillGoodsId: state.currentItem.id,
      count: state.buyCount,
      addressId: address.id
    })
    state.buyVisible = false
    state.resultVisible = true
    state.resultStatus = ''
    startPolling(state.currentItem.id)
  } catch { ElMessage.error('秒杀提交失败') }
  finally { state.submitting = false }
}

const startPolling = (seckillGoodsId: number) => {
  //先清掉可能残留的轮询，防止重复提交导致多个 interval 叠加
  clearPolling()
  let count = 0
  pollingTimer.value = setInterval(async () => {
    count++
    try {
      const res = await getResult(seckillGoodsId)
      if (res) {
        if (res.status === -1) {
          state.resultStatus = 'fail'
          state.resultMsg = '秒杀失败，请重试'
        } else {
          state.resultStatus = 'success'
        }
        clearPolling()
      }
    } catch { /* retry */ }
    // 80 次 × 1.5 秒 = 2 分钟，超时停止轮询
    if (count > 80) {
      state.resultStatus = 'fail'
      state.resultMsg = '秒杀超时，请稍后查看订单'
      clearPolling()
    }
  }, 1500)
}

const clearPolling = () => {
  if (pollingTimer.value) { clearInterval(pollingTimer.value); pollingTimer.value = null }
}

onMounted(() => { loadList() })
onUnmounted(() => { clearPolling() })
</script>

<style scoped>
.seckill-container { min-height: 100vh; background: #f5f5f5; padding-top: 44px; }
.page-header { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #ff4444; color: white; font-size: 16px; font-weight: bold; position: sticky; top: 0; z-index: 100; }
.back-icon { cursor: pointer; }
.search-box { display: flex; align-items: center; gap: 8px; margin: 10px; padding: 8px 12px; background: white; border-radius: 18px; color: #999; }
.search-box input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; color: #333; }
.seckill-item { display: flex; align-items: center; gap: 12px; padding: 12px; margin: 10px; background: white; border-radius: 8px; }
.seckill-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; }
.seckill-info { flex: 1; }
.goods-name { font-size: 14px; font-weight: bold; margin-bottom: 6px; }
.price-row { margin-bottom: 4px; }
.seckill-price { color: #ff4444; font-size: 16px; font-weight: bold; margin-right: 8px; }
.original-price { color: #999; font-size: 12px; text-decoration: line-through; }
.stock { color: #999; font-size: 12px; }
.buy-info p { margin: 8px 0; }
.polling-box { text-align: center; padding: 20px; }
.loading-icon { color: #409eff; animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
