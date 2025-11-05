<template>
  <div class="application-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的申请</span>
          <el-button type="primary" @click="$router.push('/main/application/create')" :icon="Plus">
            新建申请
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <el-form :model="searchForm" inline>
        <el-form-item label="申请状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="审批中" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
            <el-option label="已支付" value="paid" />
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

      <!-- 申请列表 -->
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />

        <el-table-column prop="applicationNo" label="申请单号" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">
              {{ row.applicationNo }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="报销类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="reason" label="申请事由" min-width="200" show-overflow-tooltip />

        <el-table-column prop="totalAmount" label="报销金额" width="120" align="right">
          <template #default="{ row }">¥ {{ row.totalAmount }}</template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="light">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="申请时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createTime) }}</template>
        </el-table-column>

        <el-table-column prop="currentApprover" label="当前审批人" width="120" />

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">查看</el-button>

            <el-button v-if="row.status === 'draft'" link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>

            <el-button
              v-if="row.status === 'pending'"
              link
              type="danger"
              @click="handleWithdraw(row)"
            >
              撤销
            </el-button>

            <el-button
              v-if="row.status === 'rejected'"
              link
              type="primary"
              @click="handleResubmit(row)"
            >
              重新提交
            </el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { getApplications, updateApplication } from '@/utils/storage'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const loading = ref(false)
// 在setup中添加
const userStore = useUserStore()
// ✅ 表格数据
const tableData = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  status: '',
  type: '',
  dateRange: [],
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 模拟表格数据

// 状态标签类型映射
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

// 状态文本映射
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

// 类型标签类型映射
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

// 类型文本映射
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

// 日期格式化
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
    status: '',
    type: '',
    dateRange: [],
  })
  handleSearch()
}

// 查看详情
const handleViewDetail = (row: any) => {
  router.push(`/main/application/detail/${row.id}`)
}

// 修改编辑方法
const handleEdit = (row: any) => {
  router.push(`/main/application/edit/${row.id}`)
}

// 撤销申请
const handleWithdraw = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要撤销这条申请吗？', '提示', {
      type: 'warning',
    })

    // 更新申请状态
    updateApplication(row.id, { status: 'draft' })
    ElMessage.success('撤销成功')
    loadTableData()
  } catch (error) {
    // 用户取消
  }
}

// 重新提交
const handleResubmit = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要重新提交这条申请吗？', '提示', {
      type: 'warning',
    })

    // 更新申请状态
    updateApplication(row.id, { status: 'pending' })
    ElMessage.success('重新提交成功')
    loadTableData()
  } catch (error) {
    // 用户取消
  }
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
// 修改 loadTableData 方法：
const loadTableData = async () => {
  loading.value = true
  try {
    // 从 localStorage 获取所有申请数据
    const allApplications = getApplications()

    // 使用真实的用户信息
    const currentUser = userStore.name

    const myApplications = allApplications.filter((app: any) => app.applicant === currentUser)

    console.log('当前用户:', currentUser)
    console.log('我的申请:', myApplications)

    // 应用筛选条件
    const filteredData = filterData(myApplications)
    pagination.total = filteredData.length

    // 分页
    const start = (pagination.currentPage - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = filteredData.slice(start, end)
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 数据过滤（模拟后端筛选）
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
.application-list {
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
