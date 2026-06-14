<template>
  <div class="admin-login">
    <div class="login-box">
      <div class="login-header">
        <p style="color: #409EFF; font-size: 18px; font-weight: bold;">管理员登录</p>
      </div>

      <el-form
        :model="state.form"
        :rules="rules"
        ref="formRef"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="state.form.username"
            placeholder="请输入管理员账号"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="state.form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="state.loading"
            @click="handleLogin"
            class="login-btn"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-links">
        <el-link type="primary" @click="goToUserLogin">返回用户登录</el-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAdminStore } from '@/stores/admin/admin'

const router = useRouter()
const formRef = ref()
const adminStore = useAdminStore()

const state = reactive({
  form: {
    username: '',
    password: ''
  },
  loading: false
})

const rules = {
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  state.loading = true
  try {
    await adminStore.doLogin({
      username: state.form.username,
      password: state.form.password
    })
    ElMessage.success('登录成功')
    router.push('/admin')
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    state.loading = false
  }
}

const goToUserLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 24px;
  margin: 15px 0 5px;
}

.login-btn {
  width: 100%;
}

.login-links {
  text-align: center;
  margin: 15px 0;
}

.login-footer {
  text-align: center;
  color: #999;
  font-size: 12px;
}
</style>
