<!-- 卡片内容 -->
<template>
  <div class="application-detail">
    <el-card v-if="detail.id">
      <template #header>
        <div class="card-header">
          <span>申请详情 - {{ detail.applicationNo }}</span>
          <el-button @click="$router.back()">返回</el-button>
          <el-button v-if="detail.status === 'draft'" type="primary" @click="handleEdit">
            编辑
          </el-button>
        </div>
      </template>

      <!-- 申请基本信息 -->
      <el-descriptions title="基本信息" :column="3" border>
        <el-descriptions-item label="申请单号">{{ detail.applicationNo }}</el-descriptions-item>
        <el-descriptions-item label="报销类型">{{ getTypeText(detail.type) }}</el-descriptions-item>
        <el-descriptions-item label="申请状态">
          <el-tag :type="getStatusTagType(detail.status)">{{
            getStatusText(detail.status)
          }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请事由" :span="2">{{ detail.reason }}</el-descriptions-item>
        <el-descriptions-item label="紧急程度">{{
          getUrgencyText(detail.urgency)
        }}</el-descriptions-item>
        <el-descriptions-item label="报销金额">¥ {{ detail.totalAmount }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detail.applicant }}</el-descriptions-item>
        <el-descriptions-item label="所在部门">{{ detail.department }}</el-descriptions-item>
      </el-descriptions>

      <!-- 费用明细 -->
      <div class="section">
        <h3>费用明细</h3>
        <el-table :data="detail.expenseItems" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="category" label="费用类型" width="120">
            <template #default="{ row }">{{ getCategoryText(row.category) }}</template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="120" align="right">
            <template #default="{ row }">¥ {{ row.amount }}</template>
          </el-table-column>
          <el-table-column prop="description" label="说明" />
        </el-table>
        <div class="total-amount">合计：¥ {{ detail.totalAmount }}</div>
      </div>

      <!-- 附件信息 -->
      <div class="section" v-if="detail.attachments && detail.attachments.length">
        <h3>附件信息</h3>
        <div class="attachments">
          <el-tag
            v-for="(attachment, index) in detail.attachments"
            :key="index"
            type="info"
            style="margin-right: 8px; margin-bottom: 8px"
          >
            {{ attachment.name }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <!-- 加载状态 -->
    <el-card v-else-if="loading">
      <el-skeleton :rows="10" animated />
    </el-card>

    <!-- 空状态 -->
    <el-card v-else>
      <el-empty description="申请不存在">
        <el-button @click="$router.back()">返回列表</el-button>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getApplications } from '@/utils/storage'

const route = useRoute()
const router = useRouter()
const applicationId = route.params.id as string

const loading = ref(true)
const detail = ref<any>({})

const handleEdit = () => {
  router.push(`/main/application/edit/${detail.value.id}`)
}
// 文本映射函数
const getStatusTagType = (status: string) => {
  const map: any = {
    draft: 'info',
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    paid: '',
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: any = {
    draft: '草稿',
    pending: '审批中',
    approved: '已通过',
    rejected: '已驳回',
    paid: '已支付',
  }
  return map[status] || status
}

const getTypeText = (type: string) => {
  const map: any = {
    travel: '差旅费',
    office: '办公费',
    entertainment: '招待费',
    purchase: '采购费',
    other: '其他',
  }
  return map[type] || type
}

const getUrgencyText = (urgency: string) => {
  const map: any = { normal: '普通', urgent: '紧急', critical: '特急' }
  return map[urgency] || urgency
}

const getCategoryText = (category: string) => {
  const map: any = {
    transport: '交通费',
    accommodation: '住宿费',
    meal: '餐饮费',
    office_supplies: '办公用品',
    other: '其他',
  }
  return map[category] || category
}

// 加载详情数据
const loadDetailData = async () => {
  loading.value = true
  try {
    // 从 localStorage 获取数据
    const applications = getApplications()
    const application = applications.find((app: any) => app.id === applicationId)

    if (application) {
      detail.value = application
    } else {
      ElMessage.error('申请不存在')
    }
  } catch (error) {
    ElMessage.error('加载详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDetailData()
})
</script>

<style scoped>
.application-detail {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section {
  margin-top: 24px;
}

.section h3 {
  margin-bottom: 16px;
  color: #303133;
}

.total-amount {
  text-align: right;
  margin-top: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
}

.attachments {
  display: flex;
  flex-wrap: wrap;
}
</style>
