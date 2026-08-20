<template>
  <div class="goods-detail">
    <PageHeader title="商品详情" :topOffset="44" @back="goBack" />

    
    <div class="detail-content" v-if="state.goods.id">
      <div class="goods-info">
        <h1 class="goods-name">{{ state.goods.name }}</h1>
        <div class="goods-price">
          <span class="price-value">{{ formatPrice(state.goods.sellingPrice) }}</span>
          <span class="original-price" v-if="state.goods.originalPrice">
            ¥{{ formatPrice(state.goods.originalPrice) }}
          </span>
        </div>
        <p class="goods-intro">{{ state.goods.intro }}</p>

        <div class="category-row">
          <el-tag
            v-if="state.categoryName"
            type="warning"
            effect="plain"
            size="small"
            class="category-tag"
            @click="goToCategory"
          >
            {{ state.categoryName }}
          </el-tag>
        </div>

        <div class="goods-tags">
          <el-tag v-if="state.goods.tag" type="danger" size="small">{{ state.goods.tag }}</el-tag>
          <el-tag type="info" size="small">免邮费</el-tag>
          <el-tag type="info" size="small">正品保证</el-tag>
        </div>
      </div>

      <img :src="state.goods.coverImg" :alt="state.goods.name" class="goods-cover" />


      <div class="goods-detail-content">
        <div class="detail-title">商品详情</div>
        <div class="detail-html" v-html="state.goods.detailContent"></div>
      </div>
    </div>


    <el-skeleton :rows="10" animated v-else />


    <div class="action-bar" v-if="state.goods.id">
      <div class="action-right">
        <el-button type="warning" @click="handleAddCart" :loading="state.adding">
          加入购物车
        </el-button>
        <el-button type="danger" @click="handleBuyNow">
          立即购买
        </el-button>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import BottomNav from '@/components/BottomNav.vue'
import { getGoodsById } from '@/api/user/goods'
import { addItem } from '@/api/user/cart'
import { getCategory, type IndexCategoryVO } from '@/api/user/category'
import { formatPrice } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const state = reactive({
  goods: {} as any,
  loading: false,
  adding: false,
  categoryName: ''
})


const loadGoodsDetail = async () => {
  const { id } = route.params
  if (!id) {
    ElMessage.error('商品ID不存在')
    return
  }

  state.loading = true
  try {
    const res = await getGoodsById(Number(id))
    state.goods = res || {}
    await loadCategoryName()
  } catch (error) {
    ElMessage.error('加载商品详情失败')
    console.error(error)
  } finally {
    state.loading = false
  }
}

const findCategoryName = (tree: IndexCategoryVO[], id: number): string => {
  for (const c of tree) {
    if (c.id === id) return c.name
    for (const sub of c.children || []) {
      if (sub.id === id) return `${c.name} > ${sub.name}`
    }
  }
  return ''
}

const loadCategoryName = async () => {
  const cid = state.goods.categoryId
  if (!cid) return
  try {
    const tree = await getCategory()
    state.categoryName = findCategoryName(tree, cid)
  } catch { /* 分类名拿不到不影响详情展示 */ }
}

const goToCategory = () => {
  if (!state.goods.categoryId) return
  router.push({ path: '/goods-search', query: { categoryId: state.goods.categoryId } })
}

const goBack = () => {
  router.back()
}

const handleAddCart = async () => {
  if (!state.goods.id) return

  state.adding = true
  try {
    await addItem({
      goodsId: state.goods.id,
      goodsCount: 1
    })
    ElMessage.success('加入购物车成功')
  } catch (error) {
    ElMessage.error('加入购物车失败')
  } finally {
    state.adding = false
  }
}

const handleBuyNow = async () => {
  if (!state.goods.id) return

  try {
    await addItem({
      goodsId: state.goods.id,
      goodsCount: 1
    })
    router.push('/cart')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  loadGoodsDetail()
})
</script>

<style scoped>
.goods-detail {
  min-height: 100vh;
  background: var(--bg-warm);
  padding-top: 44px;
  padding-bottom: 70px;
}

.detail-content { padding-top: 0; }

.goods-cover {
  display: block;
  width: 72%;
  max-width: 340px;
  margin: 20px auto;
  aspect-ratio: 1;
  object-fit: cover;
  background: #e8e4de;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.goods-info {
  background: var(--card);
  padding: 20px 16px;
  margin: 12px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.goods-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 12px;
}

.price-value {
  font-size: 34px;
  font-weight: 700;
  color: var(--price-red);
  font-family: var(--font-display);
}
.price-value::before { content: '¥'; font-size: 20px; margin-right: 2px; }

.original-price {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: line-through;
  margin-left: 12px;
}

.goods-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 10px;
  line-height: 1.4;
  font-family: var(--font-display);
}

.goods-intro {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.category-row {
  margin-bottom: 10px;
}

.category-tag {
  cursor: pointer;
  transition: opacity 0.2s;
}
.category-tag:hover { opacity: 0.75; }

.goods-detail-content {
  background: var(--card);
  margin: 0 12px;
  padding: 18px 16px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.detail-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 3px solid var(--amber);
  font-family: var(--font-display);
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  padding-bottom: max(10px, env(safe-area-inset-bottom));
  background: var(--card);
  border-top: 1px solid var(--border);
  z-index: 1000;
  box-shadow: 0 -2px 16px rgba(0,0,0,0.04);
}

.action-right {
  flex: 1;
  display: flex;
  gap: 10px;
}

.action-right .el-button {
  flex: 1;
}
</style>
