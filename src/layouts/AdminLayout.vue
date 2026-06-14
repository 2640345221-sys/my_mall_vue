<template>
  <div class="admin-layout">
    <admin-sidebar :active-menu="route.meta.activeMenu as string" />
    <div class="main-content">
      <admin-header :title="route.meta.title as string" />
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import AdminSidebar from '@/components/admin/Sidebar.vue'
import AdminHeader from '@/components/admin/Header.vue'

const route = useRoute()
</script>

<style scoped>
.admin-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
