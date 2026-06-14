<template>
  <div class="pagination">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      :prev-text="'上一页'"
      :next-text="'下一页'"
      @current-change="$emit('pageChange', $event)"
    />
    <div class="pagination-info">
      <span class="jump-label">跳转到</span>
      <el-input-number
        v-model="jumpPage"
        :min="1"
        :max="totalPages || 1"
        size="small"
        style="width: 80px; margin: 0 8px"
        @change="handleJump"
      />
      <span class="total-pages">共 {{ totalPages }} 页</span>
      <span class="total-records">共 {{ total }} 条</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  total: number
  pageSize?: number
  modelPage?: number
}>()

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const currentPage = ref(props.modelPage || 1)
const pageSize = ref(props.pageSize || 10)
const jumpPage = ref<number | undefined>(undefined)

watch(() => props.modelPage, (v) => {
  if (v !== undefined) currentPage.value = v
})

const totalPages = computed(() => {
  const t = Number(props.total) || 0
  const s = Number(pageSize.value) || 10
  if (t <= 0 || s <= 0) return 0
  return Math.ceil(t / s)
})

function handleJump(v: number | undefined) {
  if (v && v >= 1 && v <= totalPages.value) {
    emit('pageChange', v)
  }
}
</script>

<style scoped>
.pagination {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.jump-label {
  color: #606266;
}

.total-pages,
.total-records {
  color: #606266;
  margin-left: 8px;
}
</style>
