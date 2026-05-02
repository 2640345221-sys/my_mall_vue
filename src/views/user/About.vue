<template>
  <div class="about-container">
    <!-- 顶部导航 -->
    <header class="about-header">
      <div class="header-left" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">关于我们</div>
      <div class="header-right"></div>
    </header>

    <!-- 内容区域 -->
    <div class="about-content">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo">
          <el-icon :size="60" color="#1baeae"><Shop /></el-icon>
        </div>
        <h1 class="app-name">My Mall</h1>
        <p class="app-version">版本 1.0.0</p>
      </div>

      <!-- 简介 -->
      <div class="section">
        <h2 class="section-title">
          <el-icon><InfoFilled /></el-icon>
          项目简介
        </h2>
        <p class="section-content">
          My Mall 是一套基于 Vue 3 + TypeScript + Element Plus 开发的电商系统，
          包含前台商城系统和后台管理系统。前台商城系统包含首页门户、商品分类、
          商品搜索、商品展示、购物车、订单结算、订单流程、个人订单管理、
          会员中心、地址管理等模块。
        </p>
      </div>

      <!-- 技术栈 -->
      <div class="section">
        <h2 class="section-title">
          <el-icon><Cpu /></el-icon>
          技术栈
        </h2>
        <div class="tech-list">
          <el-tag class="tech-item" type="primary">Vue 3</el-tag>
          <el-tag class="tech-item" type="success">TypeScript</el-tag>
          <el-tag class="tech-item" type="warning">Element Plus</el-tag>
          <el-tag class="tech-item" type="danger">Pinia</el-tag>
          <el-tag class="tech-item" type="info">Vue Router</el-tag>
          <el-tag class="tech-item" type="primary">Axios</el-tag>
          <el-tag class="tech-item" type="success">Vite</el-tag>
        </div>
      </div>

      <!-- 版权信息 -->
      <div class="footer">
        <p>© 2026 My Mall. All rights reserved.</p>
        <p>本系统仅供学习交流使用</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft, Shop, InfoFilled, Cpu, Message } from '@element-plus/icons-vue'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.about-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.about-header {
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

.about-content {
  padding-top: 50px;
}

.logo-section {
  text-align: center;
  padding: 40px 20px;
  background: white;
  margin-bottom: 10px;
}

.app-name {
  font-size: 24px;
  margin-bottom: 8px;
}

.app-version {
  font-size: 14px;
  color: #999;
}

.section {
  background: white;
  padding: 20px;
  margin-bottom: 10px;
}

.section-title {
  font-size: 16px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-content {
  font-size: 14px;
  color: #666;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.footer {
  text-align: center;
  padding: 30px 20px;
  color: #999;
  font-size: 12px;
}
</style>
