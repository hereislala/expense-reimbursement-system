<template>
  <div class="approval-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的审批</span>
          <el-tag type="warning">待我审批：{{ pendingCount }} 条</el-tag>
        </div>
      </template>

      <!-- 筛选条件 -->
      <el-form :model="searchForm" inline>
        <el-form-item label="审批状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="待我审批" value="pending" />
            <el-option label="我已审批" value="processed" />
          </el-select>
        </el-form-item>

        <el-form-item label="报销类型">
          <el-select v-model="searchForm.type" placeholder="全部类型" clearable>
            <el-option label="差旅费" value="travel" />
            <el-option label="办公费" value="office" />
            <el-option label="招待费" value="entertainment" />
            <el-option label="采购费" value="purchase" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="申请日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 审批列表 -->
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />

        <el-table-column prop="applicationNo" label="申请单号" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">
              {{ row.applicationNo }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column prop="applicant" label="申请人" width="120" />

        <el-table-column prop="department" label="所在部门" width="120" />

        <el-table-column prop="type" label="报销类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="reason" label="申请事由" min-width="200" show-overflow-tooltip />

        <el-table-column prop="totalAmount" label="报销金额" width="120" align="right">
          <template #default="{ row }">¥ {{ row.totalAmount }}</template>
        </el-table-column>

        <el-table-column prop="createTime" label="申请时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createTime) }}</template>
        </el-table-column>

        <el-table-column prop="urgency" label="紧急程度" width="100">
          <template #default="{ row }">
            <el-tag :type="getUrgencyTagType(row.urgency)" effect="light">
              {{ getUrgencyText(row.urgency) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">查看详情</el-button>

            <el-button
              v-if="row.approvalStatus === 'pending'"
              type="success"
              link
              @click="handleApprove(row)"
            >
              通过
            </el-button>

            <el-button
              v-if="row.approvalStatus === 'pending'"
              type="danger"
              link
              @click="handleReject(row)"
            >
              驳回
            </el-button>

            <el-button
              v-if="row.approvalStatus === 'pending'"
              type="warning"
              link
              @click="handleTransfer(row)"
            >
              转交
            </el-button>

            <el-tag
              v-if="row.approvalStatus === 'processed'"
              :type="row.myAction === 'approve' ? 'success' : 'danger'"
            >
              {{ row.myAction === 'approve' ? '已通过' : '已驳回' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 审批对话框 -->
    <approval-dialog
      v-model="approvalDialog.visible"
      :application="approvalDialog.currentApplication"
      :action="approvalDialog.action"
      @success="handleApprovalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import ApprovalDialog from './components/ApprovalDialog.vue'
import { useRouter } from 'vue-router'
// 修改数据获取方法
import {
  getApprovalApplications,
  approveApplication,
  rejectApplication,
  transferApplication,
} from '@/utils/storage'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
const router = useRouter()
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  status: 'pending', // 默认显示待审批
  type: '',
  dateRange: [],
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 审批对话框
const approvalDialog = reactive({
  visible: false,
  currentApplication: null as any,
  action: '' as 'approve' | 'reject' | 'transfer',
})

// 模拟审批数据
const tableData = ref([
  {
    id: '1',
    applicationNo: 'BX202401150001',
    applicant: '张三',
    department: '技术部',
    type: 'travel',
    reason: '北京出差参加会议交通住宿费用',
    totalAmount: 2850.0,
    createTime: '2024-01-15 10:30:00',
    urgency: 'normal',
    approvalStatus: 'pending', // pending: 待审批, processed: 已处理
    currentApprover: '李经理',
  },
  {
    id: '2',
    applicationNo: 'BX202401140002',
    applicant: '李四',
    department: '销售部',
    type: 'entertainment',
    reason: '客户接待餐饮费用',
    totalAmount: 800.0,
    createTime: '2024-01-14 16:20:00',
    urgency: 'urgent',
    approvalStatus: 'pending',
    currentApprover: '李经理',
  },
  {
    id: '3',
    applicationNo: 'BX202401130003',
    applicant: '王五',
    department: '市场部',
    type: 'office',
    reason: '采购办公用品及打印机耗材',
    totalAmount: 1200.5,
    createTime: '2024-01-13 09:15:00',
    urgency: 'normal',
    approvalStatus: 'processed',
    myAction: 'approve',
    currentApprover: '已完成',
  },
  {
    id: '4',
    applicationNo: 'BX202401120004',
    applicant: '赵六',
    department: '产品部',
    type: 'purchase',
    reason: '项目所需设备采购',
    totalAmount: 4500.0,
    createTime: '2024-01-12 14:45:00',
    urgency: 'normal',
    approvalStatus: 'processed',
    myAction: 'reject',
    currentApprover: '已完成',
  },
])

// 计算待审批数量
const pendingCount = computed(() => {
  return tableData.value.filter((item) => item.approvalStatus === 'pending').length
})

// 文本映射函数
const getTypeTagType = (type: string) => {
  const map: any = {
    travel: 'success',
    office: '',
    entertainment: 'warning',
    purchase: 'danger',
    other: 'info',
  }
  return map[type] || 'info'
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

const getUrgencyTagType = (urgency: string) => {
  const map: any = {
    normal: '',
    urgent: 'warning',
    critical: 'danger',
  }
  return map[urgency] || ''
}

const getUrgencyText = (urgency: string) => {
  const map: any = {
    normal: '普通',
    urgent: '紧急',
    critical: '特急',
  }
  return map[urgency] || urgency
}

const formatDate = (dateString: string) => {
  return dateString.split(' ')[0]
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadTableData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    status: 'pending',
    type: '',
    dateRange: [],
  })
  handleSearch()
}

// 查看详情
const handleViewDetail = (row: any) => {
  // 这里可以跳转到申请详情页面，或者打开一个详情弹窗
  //ElMessage.info(`查看申请详情: ${row.applicationNo}`)
  router.push(`/main/application/detail/${row.id}`)
}

// 通过审批
const handleApprove = (row: any) => {
  approvalDialog.currentApplication = row
  approvalDialog.action = 'approve'
  approvalDialog.visible = true
}

// 驳回审批
const handleReject = (row: any) => {
  approvalDialog.currentApplication = row
  approvalDialog.action = 'reject'
  approvalDialog.visible = true
}

// 转交审批
const handleTransfer = (row: any) => {
  approvalDialog.currentApplication = row
  approvalDialog.action = 'transfer'
  approvalDialog.visible = true
}

// 审批成功回调
const handleApprovalSuccess = () => {
  loadTableData()
  ElMessage.success('操作成功')
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadTableData()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadTableData()
}

// 加载表格数据
// 在 loadTableData 方法开头添加详细日志
const loadTableData = async () => {
  loading.value = true
  try {
    console.log('=== 开始加载审批数据 ===')

    // 从 localStorage 获取审批数据
    const allApplications = getApprovalApplications()
    console.log('1. 所有审批相关申请:', allApplications)

    // 获取当前用户
    const currentUser = userStore.name
    console.log('2. 当前登录用户:', currentUser)

    // 待我审批：状态为pending且当前审批人是当前用户
    const pendingApplications = allApplications.filter((app: any) => {
      const isPendingForMe = app.status === 'pending' && app.currentApprover === currentUser
      console.log(
        `申请 ${app.applicationNo}: 状态=${app.status}, 审批人=${app.currentApprover}, 待我审批=${isPendingForMe}`,
      )
      return isPendingForMe
    })

    console.log('3. 待我审批的申请:', pendingApplications)

    // 我已审批：审批历史中有当前用户的审批记录
    const processedApplications = allApplications.filter((app: any) => {
      const hasMyApproval = app.approvalHistory?.some(
        (history: any) => history.approver === currentUser,
      )
      console.log(
        `申请 ${app.applicationNo}: 审批历史=`,
        app.approvalHistory,
        '我已审批=',
        hasMyApproval,
      )
      return hasMyApproval
    })

    console.log('4. 我已审批的申请:', processedApplications)

    let displayData = []

    if (searchForm.status === 'pending') {
      displayData = pendingApplications
    } else if (searchForm.status === 'processed') {
      displayData = processedApplications
    } else {
      displayData = [...pendingApplications, ...processedApplications]
    }
    console.log('searchForm 当前值:', JSON.stringify(searchForm))

    console.log('5. 筛选前的显示数据:', displayData)

    // 应用其他筛选条件
    const filteredData = filterData(displayData)
    console.log('6. 筛选后的数据:', filteredData)

    pagination.total = filteredData.length

    // 处理显示数据
    tableData.value = filteredData
      .map((app) => {
        const isPending = app.status === 'pending' && app.currentApprover === currentUser
        const isProcessed = app.approvalHistory?.some(
          (history: any) => history.approver === currentUser,
        )

        let myAction = undefined
        if (isProcessed) {
          const myHistory = app.approvalHistory.find(
            (history: any) => history.approver === currentUser,
          )
          myAction = myHistory?.action
        }

        return {
          ...app,
          approvalStatus: isPending ? 'pending' : 'processed',
          myAction: myAction,
        }
      })
      .slice(
        (pagination.currentPage - 1) * pagination.pageSize,
        pagination.currentPage * pagination.pageSize,
      )

    console.log('7. 最终表格数据:', tableData.value)
    console.log('=== 加载完成 ===')
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 数据过滤
const filterData = (data: any[]) => {
  return data.filter((item) => {
    let match = true

    if (searchForm.status && item.status !== searchForm.status) {
      match = false
    }

    if (searchForm.type && item.type !== searchForm.type) {
      match = false
    }

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      const [start, end] = searchForm.dateRange
      const itemDate = item.createTime.split(' ')[0]
      if (itemDate < start || itemDate > end) {
        match = false
      }
    }

    return match
  })
}

// 初始化加载数据
onMounted(() => {
  loadTableData()
})
</script>

<style scoped>
.approval-list {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}
</style>
