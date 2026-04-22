<template>
<div class="login-container">
    <div class="login-box">
      <h2 class="title">用户登录</h2>
      
      <el-form 
        :model="form" 
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item>
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="register-link">
        <el-link type="primary" @click="getRegister">还没有账号？去注册</el-link>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {reactive,ref} from 'vue'
import {useRouter} from 'vue-router'
import {useUserStore} from '@/stores/user/user'
import {ElMessage} from 'element-plus'
import {User,Lock} from '@element-plus/icons-vue'

const router=useRouter()
const userStore=useUserStore()

const form=reactive({
    username:'',
    password:''
})

const loading =ref(false)

const handleLogin =async()=>{
    if(!form.username||!form.password){
        ElMessage.warning('请填写完整信息')
        return
    }
    loading.value=true
    try{
        await userStore.doLogin({
            username:form.username,
            password:form.password
        })
        ElMessage.success('登陆成功')     
        router.replace('/home')
    }catch(error){
        console.error("error")
    }finally{
        loading.value=false
    }
}
const getRegister=()=>{
    ElMessage.info('注册功能稍后实现')
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.login-form {
  margin-top: 20px;
}

.login-btn {
  width: 100%;
}

.register-link {
  text-align: center;
  margin-top: 20px;
}
</style>