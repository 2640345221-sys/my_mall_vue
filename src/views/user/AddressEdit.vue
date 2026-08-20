<template>
  <div class="address-edit-container">
    <PageHeader :title="state.type === 'add' ? '新增地址' : '编辑地址'" :topOffset="44" @back="goBack" />

    
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
            :props="{ value: 'id', label: 'name', children: 'children' }"
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

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getById, addAddress, updateAddress, deleteById } from '@/api/user/address'
import PageHeader from '@/components/PageHeader.vue'
import BottomNav from '@/components/BottomNav.vue'

const route = useRoute()
const router = useRouter()
const formRef = ref()

const state = reactive({
  type: 'add' as 'add' | 'edit',
  addressId: null as number | null,
  from: '',
  saving: false,
  deleting: false,
  form: {
    username: '',
    userPhone: '',
    region: [] as number[],
    detailAddress: '',
    isDefault: false
  },
  regionOptions: [] as Array<any>
})

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

const init = async () => {
  const { type, addressId, from } = route.query
  state.type = (type as 'add' | 'edit') || 'add'
  state.from = (from as string) || ''
  
  if (addressId) {
    state.addressId = Number(addressId)
  }
  
  loadRegionData()
  
  if (state.type === 'edit' && state.addressId) {
    await loadAddressDetail()
  }
}

const loadRegionData = () => {
  state.regionOptions = [
    {
      id: 370000,
      name: '山东省',
      children: [
        {
          id: 370100,
          name: '济南市',
          children: [
            { id: 370102, name: '历下区' },
            { id: 370103, name: '市中区' },
            { id: 370104, name: '槐荫区' },
            { id: 370105, name: '天桥区' },
            { id: 370112, name: '历城区' },
            { id: 370113, name: '长清区' },
            { id: 370114, name: '章丘区' },
            { id: 370115, name: '济阳区' },
            { id: 370116, name: '莱芜区' },
            { id: 370117, name: '钢城区' },
            { id: 370124, name: '平阴县' },
            { id: 370126, name: '商河县' }
          ]
        },
        {
          id: 370200,
          name: '青岛市',
          children: [
            { id: 370202, name: '市南区' },
            { id: 370203, name: '市北区' },
            { id: 370211, name: '黄岛区' },
            { id: 370212, name: '崂山区' },
            { id: 370213, name: '李沧区' },
            { id: 370214, name: '城阳区' },
            { id: 370215, name: '即墨区' },
            { id: 370281, name: '胶州市' },
            { id: 370283, name: '平度市' },
            { id: 370285, name: '莱西市' }
          ]
        },
        {
          id: 370300,
          name: '淄博市',
          children: [
            { id: 370302, name: '淄川区' },
            { id: 370303, name: '张店区' },
            { id: 370304, name: '博山区' },
            { id: 370305, name: '临淄区' },
            { id: 370306, name: '周村区' },
            { id: 370321, name: '桓台县' },
            { id: 370322, name: '高青县' },
            { id: 370323, name: '沂源县' }
          ]
        },
        {
          id: 370400,
          name: '枣庄市',
          children: [
            { id: 370402, name: '市中区' },
            { id: 370403, name: '薛城区' },
            { id: 370404, name: '峄城区' },
            { id: 370405, name: '台儿庄区' },
            { id: 370406, name: '山亭区' },
            { id: 370481, name: '滕州市' }
          ]
        },
        {
          id: 370500,
          name: '东营市',
          children: [
            { id: 370502, name: '东营区' },
            { id: 370503, name: '河口区' },
            { id: 370505, name: '垦利区' },
            { id: 370522, name: '利津县' },
            { id: 370523, name: '广饶县' }
          ]
        },
        {
          id: 370600,
          name: '烟台市',
          children: [
            { id: 370602, name: '芝罘区' },
            { id: 370611, name: '福山区' },
            { id: 370612, name: '牟平区' },
            { id: 370613, name: '莱山区' },
            { id: 370614, name: '蓬莱区' },
            { id: 370681, name: '龙口市' },
            { id: 370682, name: '莱阳市' },
            { id: 370683, name: '莱州市' },
            { id: 370685, name: '招远市' },
            { id: 370686, name: '栖霞市' },
            { id: 370687, name: '海阳市' }
          ]
        },
        {
          id: 370700,
          name: '潍坊市',
          children: [
            { id: 370702, name: '潍城区' },
            { id: 370703, name: '寒亭区' },
            { id: 370704, name: '坊子区' },
            { id: 370705, name: '奎文区' },
            { id: 370724, name: '临朐县' },
            { id: 370725, name: '昌乐县' },
            { id: 370781, name: '青州市' },
            { id: 370782, name: '诸城市' },
            { id: 370783, name: '寿光市' },
            { id: 370784, name: '安丘市' },
            { id: 370785, name: '高密市' },
            { id: 370786, name: '昌邑市' }
          ]
        },
        {
          id: 370800,
          name: '济宁市',
          children: [
            { id: 370811, name: '任城区' },
            { id: 370812, name: '兖州区' },
            { id: 370826, name: '微山县' },
            { id: 370827, name: '鱼台县' },
            { id: 370828, name: '金乡县' },
            { id: 370829, name: '嘉祥县' },
            { id: 370830, name: '汶上县' },
            { id: 370831, name: '泗水县' },
            { id: 370832, name: '梁山县' },
            { id: 370881, name: '曲阜市' },
            { id: 370883, name: '邹城市' }
          ]
        },
        {
          id: 370900,
          name: '泰安市',
          children: [
            { id: 370902, name: '泰山区' },
            { id: 370911, name: '岱岳区' },
            { id: 370921, name: '宁阳县' },
            { id: 370923, name: '东平县' },
            { id: 370982, name: '新泰市' },
            { id: 370983, name: '肥城市' }
          ]
        },
        {
          id: 371000,
          name: '威海市',
          children: [
            { id: 371002, name: '环翠区' },
            { id: 371003, name: '文登区' },
            { id: 371082, name: '荣成市' },
            { id: 371083, name: '乳山市' }
          ]
        },
        {
          id: 371100,
          name: '日照市',
          children: [
            { id: 371102, name: '东港区' },
            { id: 371103, name: '岚山区' },
            { id: 371121, name: '五莲县' },
            { id: 371122, name: '莒县' }
          ]
        },
        {
          id: 371300,
          name: '临沂市',
          children: [
            { id: 371302, name: '兰山区' },
            { id: 371311, name: '罗庄区' },
            { id: 371312, name: '河东区' },
            { id: 371321, name: '沂南县' },
            { id: 371322, name: '郯城县' },
            { id: 371323, name: '沂水县' },
            { id: 371324, name: '兰陵县' },
            { id: 371325, name: '费县' },
            { id: 371326, name: '平邑县' },
            { id: 371327, name: '莒南县' },
            { id: 371328, name: '蒙阴县' },
            { id: 371329, name: '临沭县' }
          ]
        },
        {
          id: 371400,
          name: '德州市',
          children: [
            { id: 371402, name: '德城区' },
            { id: 371403, name: '陵城区' },
            { id: 371422, name: '宁津县' },
            { id: 371423, name: '庆云县' },
            { id: 371424, name: '临邑县' },
            { id: 371425, name: '齐河县' },
            { id: 371426, name: '平原县' },
            { id: 371427, name: '夏津县' },
            { id: 371428, name: '武城县' },
            { id: 371481, name: '乐陵市' },
            { id: 371482, name: '禹城市' }
          ]
        },
        {
          id: 371500,
          name: '聊城市',
          children: [
            { id: 371502, name: '东昌府区' },
            { id: 371503, name: '茌平区' },
            { id: 371521, name: '阳谷县' },
            { id: 371522, name: '莘县' },
            { id: 371524, name: '东阿县' },
            { id: 371525, name: '冠县' },
            { id: 371526, name: '高唐县' },
            { id: 371581, name: '临清市' }
          ]
        },
        {
          id: 371600,
          name: '滨州市',
          children: [
            { id: 371602, name: '滨城区' },
            { id: 371603, name: '沾化区' },
            { id: 371621, name: '惠民县' },
            { id: 371622, name: '阳信县' },
            { id: 371623, name: '无棣县' },
            { id: 371625, name: '博兴县' },
            { id: 371681, name: '邹平市' }
          ]
        },
        {
          id: 371700,
          name: '菏泽市',
          children: [
            { id: 371702, name: '牡丹区' },
            { id: 371703, name: '定陶区' },
            { id: 371721, name: '曹县' },
            { id: 371722, name: '单县' },
            { id: 371723, name: '成武县' },
            { id: 371724, name: '巨野县' },
            { id: 371725, name: '郓城县' },
            { id: 371726, name: '鄄城县' },
            { id: 371728, name: '东明县' }
          ]
        }
      ]
    },
    {
      id: 320000,
      name: '江苏省',
      children: [
        {
          id: 320100,
          name: '南京市',
          children: [
            { id: 320102, name: '玄武区' },
            { id: 320104, name: '秦淮区' },
            { id: 320105, name: '建邺区' },
            { id: 320106, name: '鼓楼区' },
            { id: 320111, name: '浦口区' },
            { id: 320113, name: '栖霞区' },
            { id: 320114, name: '雨花台区' },
            { id: 320115, name: '江宁区' },
            { id: 320116, name: '六合区' },
            { id: 320117, name: '溧水区' },
            { id: 320118, name: '高淳区' }
          ]
        },
        {
          id: 320200,
          name: '无锡市',
          children: [
            { id: 320205, name: '锡山区' },
            { id: 320206, name: '惠山区' },
            { id: 320211, name: '滨湖区' },
            { id: 320213, name: '梁溪区' },
            { id: 320214, name: '新吴区' },
            { id: 320281, name: '江阴市' },
            { id: 320282, name: '宜兴市' }
          ]
        },
        {
          id: 320300,
          name: '徐州市',
          children: [
            { id: 320302, name: '鼓楼区' },
            { id: 320303, name: '云龙区' },
            { id: 320305, name: '贾汪区' },
            { id: 320311, name: '泉山区' },
            { id: 320312, name: '铜山区' },
            { id: 320321, name: '丰县' },
            { id: 320322, name: '沛县' },
            { id: 320324, name: '睢宁县' },
            { id: 320381, name: '新沂市' },
            { id: 320382, name: '邳州市' }
          ]
        },
        {
          id: 320400,
          name: '常州市',
          children: [
            { id: 320402, name: '天宁区' },
            { id: 320404, name: '钟楼区' },
            { id: 320411, name: '新北区' },
            { id: 320412, name: '武进区' },
            { id: 320413, name: '金坛区' },
            { id: 320481, name: '溧阳市' }
          ]
        },
        {
          id: 320500,
          name: '苏州市',
          children: [
            { id: 320505, name: '虎丘区' },
            { id: 320506, name: '吴中区' },
            { id: 320507, name: '相城区' },
            { id: 320508, name: '姑苏区' },
            { id: 320509, name: '吴江区' },
            { id: 320581, name: '常熟市' },
            { id: 320582, name: '张家港市' },
            { id: 320583, name: '昆山市' },
            { id: 320585, name: '太仓市' }
          ]
        },
        {
          id: 320600,
          name: '南通市',
          children: [
            { id: 320602, name: '崇川区' },
            { id: 320612, name: '通州区' },
            { id: 320613, name: '海门区' },
            { id: 320623, name: '如东县' },
            { id: 320681, name: '启东市' },
            { id: 320682, name: '如皋市' },
            { id: 320685, name: '海安市' }
          ]
        },
        {
          id: 320700,
          name: '连云港市',
          children: [
            { id: 320703, name: '连云区' },
            { id: 320706, name: '海州区' },
            { id: 320707, name: '赣榆区' },
            { id: 320722, name: '东海县' },
            { id: 320723, name: '灌云县' },
            { id: 320724, name: '灌南县' }
          ]
        },
        {
          id: 320800,
          name: '淮安市',
          children: [
            { id: 320803, name: '淮安区' },
            { id: 320804, name: '淮阴区' },
            { id: 320812, name: '清江浦区' },
            { id: 320813, name: '洪泽区' },
            { id: 320826, name: '涟水县' },
            { id: 320830, name: '盱眙县' },
            { id: 320831, name: '金湖县' }
          ]
        },
        {
          id: 320900,
          name: '盐城市',
          children: [
            { id: 320902, name: '亭湖区' },
            { id: 320903, name: '盐都区' },
            { id: 320904, name: '大丰区' },
            { id: 320921, name: '响水县' },
            { id: 320922, name: '滨海县' },
            { id: 320923, name: '阜宁县' },
            { id: 320924, name: '射阳县' },
            { id: 320925, name: '建湖县' },
            { id: 320981, name: '东台市' }
          ]
        },
        {
          id: 321000,
          name: '扬州市',
          children: [
            { id: 321002, name: '广陵区' },
            { id: 321003, name: '邗江区' },
            { id: 321012, name: '江都区' },
            { id: 321023, name: '宝应县' },
            { id: 321081, name: '仪征市' },
            { id: 321084, name: '高邮市' }
          ]
        },
        {
          id: 321100,
          name: '镇江市',
          children: [
            { id: 321102, name: '京口区' },
            { id: 321111, name: '润州区' },
            { id: 321112, name: '丹徒区' },
            { id: 321181, name: '丹阳市' },
            { id: 321182, name: '扬中市' },
            { id: 321183, name: '句容市' }
          ]
        },
        {
          id: 321200,
          name: '泰州市',
          children: [
            { id: 321202, name: '海陵区' },
            { id: 321203, name: '高港区' },
            { id: 321204, name: '姜堰区' },
            { id: 321281, name: '兴化市' },
            { id: 321282, name: '靖江市' },
            { id: 321283, name: '泰兴市' }
          ]
        },
        {
          id: 321300,
          name: '宿迁市',
          children: [
            { id: 321302, name: '宿城区' },
            { id: 321321, name: '宿豫区' },
            { id: 321322, name: '沭阳县' },
            { id: 321323, name: '泗阳县' },
            { id: 321324, name: '泗洪县' }
          ]
        }
      ]
    }
  ]
}

const loadAddressDetail = async () => {
  try {
    const res = await getById(state.addressId!)
    if (res) {
      state.form.username = res.username || ''
      state.form.userPhone = res.userPhone || ''
      state.form.detailAddress = res.detailAddress || ''
      state.form.isDefault = res.isDefault || false
      
    }
  } catch (error) {
    ElMessage.error('加载地址详情失败')
  }
}

const goBack = () => {
  router.back()
}

const handleSave = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  
  state.saving = true
  try {
    const [provinceId, cityId, regionId] = state.form.region
    const province = findRegionById(state.regionOptions, provinceId)
    const city = findRegionById(province?.children || [], cityId)
    const region = findRegionById(city?.children || [], regionId)
    
    const params = {
      username: state.form.username,
      userPhone: state.form.userPhone,
      province: province?.name || '',
      city: city?.name || '',
      region: region?.name || '',
      detailAddress: state.form.detailAddress,
      isDefault: state.form.isDefault
    }
    
    if (state.type === 'edit' && state.addressId) {
      await updateAddress({
        ...params,
        id: state.addressId
      })
    } else {
      await addAddress(params)
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

const handleDelete = async () => {
  if (!state.addressId) return
  
  try {
    await ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    state.deleting = true
    await deleteById(state.addressId)
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

const findRegionById = (list: Array<any>, id: number) => {
  return list.find(item => item.id === id)
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.address-edit-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 44px;
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
  padding: 20px 15px;
  background: white;
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

.bottom-bar .el-button + .el-button {
  margin-left: 0;
}
</style>
