<template>
  <div class="profile-container">
    <!-- 顶部导航 -->
    <header class="profile-header">
      <div class="header-left" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">个人资料</div>
      <div class="header-right"></div>
    </header>

    <!-- 表单区域 -->
    <div class="form-section">
      <el-form :model="state.form" label-position="top" :rules="rules" ref="formRef">
        <!-- 昵称 -->
        <el-form-item label="昵称" prop="nickName">
          <el-input
            v-model="state.form.nickName"
            placeholder="请输入昵称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <!-- 登录名 -->
        <el-form-item label="登录名">
          <el-input
            v-model="state.form.loginName"
            disabled
          />
          <div class="form-tip">登录名不可修改</div>
        </el-form-item>

        <!-- 个性签名 -->
        <el-form-item label="个性签名" prop="introduceSign">
          <el-input
            v-model="state.form.introduceSign"
            type="textarea"
            rows="3"
            placeholder="介绍一下自己吧~"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="state.form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 保存按钮 -->
    <div class="action-buttons">
      <el-button
        type="primary"
        size="large"
        :loading="state.saving"
        @click="handleSave"
        class="save-btn"
      >
        保存修改
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()

const state = reactive({
  form: {
    nickName: '',
    loginName: '',
    introduceSign: '',
    password: ''
  },
  saving: false
})

// 表单验证规则
const rules = {
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在2-20个字符之间', trigger: 'blur' }
  ],
  introduceSign: [
    { max: 100, message: '个性签名不能超过100个字符', trigger: 'blur' }
  ],
  password: [
    { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' }
  ]
}

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res = await userStore.getInfo()
    if (res) {
      state.form.nickName = res.nickName || ''
      state.form.loginName = res.loginName || ''
      state.form.introduceSign = res.introduceSign || ''
    }
    const storedPassword = localStorage.getItem('userPassword')
    if (storedPassword) {
      state.form.password = storedPassword
    }
  } catch (error) {
    ElMessage.error('加载用户信息失败')
    console.error(error)
  }
}

// 保存修改
const handleSave = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  state.saving = true
  try {
    const params: any = {
      nickName: state.form.nickName,
      introduceSign: state.form.introduceSign
    }

    if (state.form.password) {
      params.password = state.form.password
    }

    await userStore.updateInfo(params)
    ElMessage.success('保存成功')

    if (state.form.password) {
      localStorage.setItem('userPassword', state.form.password)
    }

    await userStore.getInfo()
    
    setTimeout(() => {
      router.push('/user')
    }, 500)
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    state.saving = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.profile-header {
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

.form-section {
  margin-top: 44px;
  padding: 20px;
  background: white;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.action-buttons {
  padding: 20px;
}

.save-btn {
  width: 100%;
}
</style>