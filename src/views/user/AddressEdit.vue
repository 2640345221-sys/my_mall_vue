<template>
  <div class="address-edit-container">
    <!-- 顶部导航 -->
    <header class="edit-header">
      <div class="header-left" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">{{ state.type === 'add' ? '新增地址' : '编辑地址' }}</div>
      <div class="header-right"></div>
    </header>

    <!-- 地址表单 -->
    <div class="edit-form">
      <el-form :model="state.form" label-position="top" :rules="rules" ref="formRef">
        <el-form-item label="收货人" prop="username">
          <el-input v-model="state.form.username" placeholder="请输入收货人姓名" />
        </el-form-item>
        
        <el-form-item label="手机号码" prop="userPhone">
          <el-input v-model="state.form.userPhone" placeholder="请输入手机号码" maxlength="11" />
        </el-form-item>
        
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="state.form.region"
            :options="state.regionOptions"
            :props="{ value: 'name', label: 'name', children: 'children' }"
            placeholder="请选择省/市/区"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input
            v-model="state.form.detailAddress"
            type="textarea"
            rows="3"
            placeholder="请输入详细地址，如街道、门牌号等"
          />
        </el-form-item>
        
        <el-form-item>
          <div class="default-switch">
            <span>设为默认地址</span>
            <el-switch v-model="state.form.isDefault" />
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-bar">
      <el-button type="primary" size="large" @click="handleSave" :loading="state.saving">
        保存
      </el-button>
      <el-button
        v-if="state.type === 'edit'"
        type="danger"
        size="large"
        @click="handleDelete"
        :loading="state.deleting"
      >
        删除
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useAddressStore, type UserAddress } from '@/stores/user/address'

const route = useRoute()
const router = useRouter()
const addressStore = useAddressStore()
const formRef = ref()

const state = reactive({
  type: 'add' as 'add' | 'edit',
  addressId:0 as number,
  from: '',
  saving: false,
  deleting: false,
  form: {
    username: '',
    userPhone: '',
    region: [] as string[],
    detailAddress: '',
    isDefault: false
  },
  regionOptions: [] as Array<any>
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在2-20个字符之间', trigger: 'blur' }
  ],
  userPhone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择所在地区', trigger: 'change' }
  ],
  detailAddress: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 100, message: '详细地址长度在5-100个字符之间', trigger: 'blur' }
  ]
}

// 初始化
const init = async () => {
  const { type, addressId, from } = route.query
  state.type = (type as 'add' | 'edit') || 'add'
  state.from = (from as string) || ''
  
  if (addressId) {
    state.addressId = Number(addressId)
  }
  
  // 加载地区数据
  loadRegionData()
  
  // 如果是编辑模式，加载地址详情
  if (state.type === 'edit' && state.addressId) {
    await loadAddressDetail()
  }
}

const loadRegionData = () => {
  // 这里简化处理，实际应该调用后端接口获取省市区数据
  // 或者使用前端静态数据
  state.regionOptions = [
    {
      name: '北京市',
      children: [
        {
          name: '北京市',
          children: [
            { name: '东城区' },
            { name: '西城区' },
            { name: '朝阳区' },
            { name: '丰台区' },
            { name: '海淀区' }
          ]
        }
      ]
    },
    {
      name: '上海市',
      children: [
        {
          name: '上海市',
          children: [
            { name: '黄浦区' },
            { name: '徐汇区' },
            { name: '长宁区' },
            { name: '静安区' },
            { name: '虹口区' }
          ]
        }
      ]
    },
    {
      name: '广东省',
      children: [
        {
          name: '广州市',
          children: [
            { name: '荔湾区' },
            { name: '越秀区' },
            { name: '海珠区' },
            { name: '天河区' },
            { name: '白云区' }
          ]
        },
        {
          name: '深圳市',
          children: [
            { name: '罗湖区' },
            { name: '福田区' },
            { name: '南山区' },
            { name: '宝安区' },
            { name: '龙岗区' }
          ]
        }
      ]
    }
  ]
}

// 加载地址详情
const loadAddressDetail = async () => {
  try {
    const res = await addressStore.getById(state.addressId!)
    if (res) {
      state.form.username = res.username || ''
      state.form.userPhone = res.userPhone || ''
      state.form.detailAddress = res.detailAddress || ''
      state.form.isDefault = res.isDefault || false
      
      if (res.province && res.city && res.region) {
        state.form.region = [res.province, res.city, res.region]
      }
    }
  } catch (error) {
    ElMessage.error('加载地址详情失败')
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 保存地址
const handleSave = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  
  state.saving = true
  try {
    const region = state.form.region
    const province = region[0] || ''
    const city = region[1] || ''
    const regionName = region[2] || ''
    
    const params:UserAddress = {
      username: state.form.username,
      userPhone: state.form.userPhone,
      province: province,
      city: city,
      region: regionName,
      detailAddress: state.form.detailAddress,
      isDefault: state.form.isDefault,
      id:state.addressId,
      userId:0
    }
    
    if (state.type === 'edit' && state.addressId) {
      await addressStore.updateAddress(params)
    } else {
      await addressStore.addAddress(params)
    }
    
    ElMessage.success('保存成功')
    setTimeout(() => {
      goBack()
    }, 1000)
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    state.saving = false
  }
}

// 删除地址
const handleDelete = async () => {
  if (!state.addressId) return
  
  try {
    await ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    state.deleting = true
    await addressStore.deleteAddress(state.addressId)
    ElMessage.success('删除成功')
    setTimeout(() => {
      goBack()
    }, 1000)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  } finally {
    state.deleting = false
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.address-edit-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100px;
}

.edit-header {
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

.edit-form {
  padding-top: 50px;
  background: white;
  padding-left: 15px;
  padding-right: 15px;
  padding-bottom: 20px;
}

.default-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px 0;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 15px;
  background: white;
  border-top: 1px solid #eee;
  z-index: 1000;
}

.bottom-bar .el-button {
  width: 100%;
}
</style>
