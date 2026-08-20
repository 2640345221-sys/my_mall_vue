<template>
  <div class="setting-container">
    <PageHeader title="账号管理" :topOffset="44" @back="goBack" />

    
    <div class="setting-form">
      <el-form :model="state.form" label-position="top" :rules="rules" ref="formRef">

        <el-form-item label="账号">
          <el-input :model-value="state.loginName" disabled />
        </el-form-item>


        <el-form-item label="注册时间">
          <el-input :model-value="state.createTime" disabled />
        </el-form-item>


        <el-form-item label="昵称" prop="nickName">
          <el-input
            v-model="state.form.nickName"
            placeholder="请输入昵称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        
        <el-form-item label="个性签名" prop="introduceSign">
          <el-input
            v-model="state.form.introduceSign"
            type="textarea"
            rows="3"
            placeholder="请输入个性签名"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        
        <el-form-item label="修改密码" prop="password">
          <el-input
            v-model="state.form.password"
            type="password"
            placeholder="不修改请留空"
            show-password
          />
        </el-form-item>

        
        <el-form-item label="确认密码" prop="confirmPassword" v-if="state.form.password">
          <el-input
            v-model="state.form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
      </el-form>
    </div>

    
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

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import BottomNav from '@/components/BottomNav.vue'
import { useUserStore } from '@/stores/user/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()

const state = reactive({
  loginName: '',
  createTime: '',
  form: {
    nickName: '',
    introduceSign: '',
    password: '',
    confirmPassword: ''
  },
  saving: false
})

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
  ],
  confirmPassword: [
    {
      validator: (_rule: any, value: string, callback: Function) => {
        if (state.form.password && value !== state.form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const loadUserInfo = async () => {
  try {
    const res = await userStore.getInfo()
    if (res) {
      state.loginName = res.loginName || ''
      state.createTime = res.createTime || ''
      state.form.nickName = res.nickName || ''
      state.form.introduceSign = res.introduceSign || ''
    }
  } catch (error) {
    console.error('加载用户信息失败', error)
  }
}

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

    state.form.password = ''
    state.form.confirmPassword = ''
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    state.saving = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.setting-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 44px;
}

.setting-header {
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

.setting-form {
  padding: 20px;
  background: white;
  margin-bottom: 10px;
}

.action-buttons {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.save-btn {
  width: 100%;
}
</style>
