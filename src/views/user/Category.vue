<template>
  <div class="category-container">
    <PageHeader title="商品分类" @back="goHome">
      <template #right>
        <el-icon><MoreFilled /></el-icon>
      </template>
    </PageHeader>

    
    <div class="category-content" ref="categoryContentRef">
      
      <div class="category-nav">
        <div
          class="nav-item"
          v-for="item in state.categoryList"
          :key="item.id"
          :class="{ 'active': state.currentId === item.id }"
          @click="selectCategory(item.id)"
        >
          {{ item.name }}
        </div>
      </div>

      
      <div class="category-detail" v-if="currentCategory">
        
        <div
          class="sub-category"
          v-for="subItem in currentCategory.children"
          :key="subItem.id"
        >
          <h3 class="sub-title">{{ subItem.name }}</h3>
          
          
          <div class="third-category-list" v-if="subItem.children && subItem.children.length > 0">
            <div
              class="third-item"
              v-for="thirdItem in subItem.children"
              :key="thirdItem.id"
              @click="goToGoodsList(thirdItem.id)"
            >
              <div class="third-icon">
                <el-icon><Goods /></el-icon>
              </div>
              <span class="third-name">{{ thirdItem.name }}</span>
            </div>
          </div>
          
          
          <div class="third-category-list" v-else>
            <div
              class="third-item"
              @click="goToGoodsList(subItem.id)"
            >
              <div class="third-icon">
                <el-icon><Goods /></el-icon>
              </div>
              <span class="third-name">{{ subItem.name }}</span>
            </div>
          </div>
        </div>

        
        <el-empty
          v-if="!currentCategory.children || currentCategory.children.length === 0"
          description="暂无分类"
        />
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MoreFilled, Goods } from '@element-plus/icons-vue'
import { getCategory } from '@/api/user/category'
import PageHeader from '@/components/PageHeader.vue'
import BottomNav from '@/components/BottomNav.vue'

const router = useRouter()
const categoryContentRef = ref<HTMLElement | null>(null)

const state = reactive({
  categoryList: [] as Array<any>,
  currentId: 0,
  loading: false
})

const currentCategory = computed(() => {
  return state.categoryList.find(item => item.id === state.currentId)
})

const loadCategoryData = async () => {
  state.loading = true
  try {
    const res = await getCategory()
    console.log(res)
    state.categoryList = res || []
    if (state.categoryList.length > 0) {
      state.currentId = state.categoryList[0].id
    }
  } catch (error) {
    ElMessage.error('加载分类失败')
    console.error(error)
  } finally {
    state.loading = false
  }
}

const selectCategory = (id: number) => {
  state.currentId = id
}

const goHome = () => {
  router.push('/home')
}


const goToGoodsList = (categoryId?: number) => {
  if (categoryId) {
    router.push(`/goods-search?categoryId=${categoryId}`)
  }
}

onMounted(() => {
  loadCategoryData()
  if (categoryContentRef.value) {
    const screenHeight = document.documentElement.clientHeight
    categoryContentRef.value.style.height = screenHeight - 100 + 'px'
  }
})
</script>

<style scoped>
.category-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.category-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: white;
  border-bottom: 1px solid #eee;
  z-index: 1000;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
}

.header-left,
.header-right {
  font-size: 20px;
  color: #666;
}

.header-search {
  flex: 1;
  display: flex;
  align-items: center;
  margin: 0 15px;
  padding: 8px 15px;
  background: #f5f5f5;
  border-radius: 20px;
}

.header-search span {
  margin-left: 8px;
  color: #999;
  font-size: 14px;
}

.category-content {
  display: flex;
  margin-top: 60px;  /* 增加margin，确保完全避开搜索栏 */
  height: calc(100vh - 120px);  /* 设置固定高度，确保内容完全显示 */
  overflow-y: auto;  /* 允许垂直滚动 */
}

.category-nav {
  width: 28%;
  height: 100%;  /* 确保导航区域占满高度 */
  overflow-y: auto;  /* 允许导航区域滚动 */
  height: 100%;
  overflow-y: auto;
  background: #f8f8f8;
}

.nav-item {
  padding: 18px 10px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.nav-item.active {
  color: #1baeae;
  background: white;
}

.category-detail {
  flex: 1;
  height: 100%;
  padding: 15px;
  background: white;
  overflow-y: auto;  /* 允许详情区域滚动 */
}

.sub-category {
  margin-bottom: 20px;
}

.sub-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.third-category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.third-item {
  width: calc(33.33% - 10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.third-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  margin-bottom: 8px;
  color: #1baeae;
}

.third-name {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  background: white;
  border-top: 1px solid #eee;
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #666;
  font-size: 12px;
}

.nav-item.active,
.nav-item.router-link-active {
  color: #1baeae;
}
</style>
