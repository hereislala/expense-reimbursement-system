<template>
  <div class="approval-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>审批详情 - {{ detail.applicationNo }}</span>
          <div>
            <el-button @click="$router.back()">返回</el-button>
            <el-button
              v-if="detail.approvalStatus === 'pending'"
              type="success"
              @click="handleApprove"
            >
              通过
            </el-button>
            <el-button
              v-if="detail.approvalStatus === 'pending'"
              type="danger"
              @click="handleReject"
            >
              驳回
            </el-button>
          </div>
        </div>
      </template>

      <!-- 申请基本信息 -->
      <el-descriptions title="申请信息" :column="3" border>
        <el-descriptions-item label="申请单号">{{ detail.applicationNo }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detail.applicant }}</el-descriptions-item>
        <el-descriptions-item label="所在部门">{{ detail.department }}</el-descriptions-item>
        <el-descriptions-item label="报销类型">{{ getTypeText(detail.type) }}</el-descriptions-item>
        <el-descriptions-item label="紧急程度">
          <el-tag :type="getUrgencyTagType(detail.urgency)">{{
            getUrgencyText(detail.urgency)
          }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请状态">
          <el-tag :type="getStatusTagType(detail.status)">{{
            getStatusText(detail.status)
          }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请事由" :span="3">{{ detail.reason }}</el-descriptions-item>
        <el-descriptions-item label="报销金额">¥ {{ detail.totalAmount }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ detail.createTime }}</el-descriptions-item>
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
          <el-table-column label="发票" width="80">
            <template #default="{ row }">
              <el-button link type="primary" v-if="row.invoice">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="total-amount">合计：¥ {{ detail.totalAmount }}</div>
      </div>

      <!-- 审批流程 -->
      <div class="section">
        <h3>审批流程</h3>
        <el-steps :active="getActiveStep" align-center finish-status="success">
          <el-step title="提交申请" :description="detail.createTime" />
          <el-step
            v-for="(step, index) in detail.approvalFlow"
            :key="index"
            :title="step.approverRole"
            :description="getStepDescription(step)"
            :status="getStepStatus(step)"
          />
        </el-steps>
      </div>

      <!-- 审批记录 -->
      <div class="section" v-if="detail.approvalHistory && detail.approvalHistory.length">
        <h3>审批记录</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(record, index) in detail.approvalHistory"
            :key="index"
            :timestamp="record.time"
            :type="getTimelineType(record.action)"
            :icon="getTimelineIcon(record.action)"
          >
            <div class="record-item">
              <div class="record-header">
                <span class="approver">{{ record.approver }}</span>
                <el-tag :type="getActionTagType(record.action)" size="small">
                  {{ getActionText(record.action) }}
                </el-tag>
              </div>
              <div v-if="record.comment" class="comment">审批意见：{{ record.comment }}</div>
              <div v-if="record.transferTo" class="transfer">转交给：{{ record.transferTo }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>

    <!-- 审批对话框 -->
    <approval-dialog
      v-model="approvalDialog.visible"
      :application="detail"
      :action="approvalDialog.action"
      @success="handleApprovalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Check, Close, InfoFilled } from '@element-plus/icons-vue'
import ApprovalDialog from './components/ApprovalDialog.vue'

const route = useRoute()
const applicationId = route.params.id

// 审批对话框
const approvalDialog = reactive({
  visible: false,
  action: '' as 'approve' | 'reject',
})

// 模拟详情数据
const detail = ref({
  id: '1',
  applicationNo: 'BX202401150001',
  applicant: '张三',
  department: '技术部',
  type: 'travel',
  reason: '北京出差参加会议交通住宿费用',
  urgency: 'normal',
  status: 'pending',
  totalAmount: 2850.0,
  createTime: '2024-01-15 10:30:00',
  approvalStatus: 'pending',
  expenseItems: [
    {
      date: '2024-01-10',
      category: 'transport',
      amount: 650.0,
      description: '往返高铁票',
      invoice: true,
    },
    {
      date: '2024-01-10',
      category: 'accommodation',
      amount: 1200.0,
      description: '酒店住宿3晚',
      invoice: true,
    },
    {
      date: '2024-01-11',
      category: 'meal',
      amount: 300.0,
      description: '餐饮补贴',
      invoice: false,
    },
    {
      date: '2024-01-12',
      category: 'transport',
      amount: 700.0,
      description: '市内交通及出租车',
      invoice: true,
    },
  ],
  approvalFlow: [
    { approverRole: '部门经理', approver: '李经理', status: 'completed' },
    { approverRole: '财务审核', approver: '王会计', status: 'inProgress' },
    { approverRole: '总监审批', approver: '张总监', status: 'pending' },
  ],
  approvalHistory: [
    { time: '2024-01-15 10:30:00', approver: '张三', action: 'submit', comment: '' },
    {
      time: '2024-01-15 11:00:00',
      approver: '李经理',
      action: 'approve',
      comment: '符合公司差旅标准，同意',
      transferTo: '',
    },
  ],
})

// 计算当前激活的步骤
const getActiveStep = computed(() => {
  const steps = detail.value.approvalFlow
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].status === 'inProgress' || steps[i].status === 'pending') {
      return i + 1 // +1 是因为第一个步骤是"提交申请"
    }
  }
  return steps.length + 1
})

// 文本映射函数
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

const getUrgencyTagType = (urgency: string) => {
  const map: any = { normal: '', urgent: 'warning', critical: 'danger' }
  return map[urgency] || ''
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

const getActionText = (action: string) => {
  const map: any = {
    submit: '提交申请',
    approve: '审批通过',
    reject: '审批驳回',
    transfer: '转交审批',
  }
  return map[action] || action
}

const getActionTagType = (action: string) => {
  const map: any = { submit: 'info', approve: 'success', reject: 'danger', transfer: 'warning' }
  return map[action] || 'info'
}

const getTimelineType = (action: string) => {
  const map: any = { submit: 'primary', approve: 'success', reject: 'danger', transfer: 'warning' }
  return map[action] || 'primary'
}

const getTimelineIcon = (action: string) => {
  const map: any = {
    submit: InfoFilled,
    approve: Check,
    reject: Close,
    transfer: InfoFilled,
  }
  return map[action] || InfoFilled
}

const getStepDescription = (step: any) => {
  if (step.status === 'completed') return `已审批 - ${step.approver}`
  if (step.status === 'inProgress') return `待审批 - ${step.approver}`
  return `待处理 - ${step.approver}`
}

const getStepStatus = (step: any) => {
  const map: any = {
    completed: 'success',
    inProgress: 'process',
    pending: 'wait',
  }
  return map[step.status] || 'wait'
}

// 审批操作
const handleApprove = () => {
  approvalDialog.action = 'approve'
  approvalDialog.visible = true
}

const handleReject = () => {
  approvalDialog.action = 'reject'
  approvalDialog.visible = true
}

const handleApprovalSuccess = () => {
  // 重新加载详情数据
  loadDetailData()
}

// 加载详情数据
const loadDetailData = async () => {
  // 这里应该根据 applicationId 调用 API 获取详情
  console.log('加载审批详情:', applicationId)
}

onMounted(() => {
  loadDetailData()
})
</script>

<style scoped>
.approval-detail {
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

.record-item {
  padding: 8px 0;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.approver {
  font-weight: 500;
}

.comment,
.transfer {
  margin-top: 4px;
  color: #606266;
  font-size: 14px;
}
</style>
