<template>
  <header class="page-header">
    <div
      class="header-left"
      :class="{ clickable: showBack }"
      @click="$emit('back')"
    >
      <el-icon v-if="showBack"><ArrowLeft /></el-icon>
    </div>
    <div class="header-title">{{ title }}</div>
    <div class="header-right">
      <slot name="right" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'

defineProps<{
  title: string
  showBack?: boolean
}>()

defineEmits<{
  back: []
}>()
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background: var(--card);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
}

.header-left {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--ink);
}

.header-left.clickable { cursor: pointer; }

.header-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  font-family: var(--font-display);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text);
}
</style>
