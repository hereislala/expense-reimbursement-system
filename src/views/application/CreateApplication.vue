<template>
  <div class="create-application">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>新建报销申请</span>
          <el-button type="primary" @click="handleSubmit">提交申请</el-button>
        </div>
      </template>

      <!-- 基本信息 -->
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="报销类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择报销类型">
                <el-option label="差旅费" value="travel" />
                <el-option label="办公费" value="office" />
                <el-option label="招待费" value="entertainment" />
                <el-option label="采购费" value="purchase" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请事由" prop="reason">
              <el-input v-model="form.reason" placeholder="请输入申请事由" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="紧急程度" prop="urgency">
              <el-select v-model="form.urgency" placeholder="请选择紧急程度">
                <el-option label="普通" value="normal" />
                <el-option label="紧急" value="urgent" />
                <el-option label="特急" value="critical" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 费用明细 -->
      <div class="expense-section">
        <div class="section-header">
          <h3>费用明细</h3>
          <el-button type="primary" @click="addExpenseItem" :icon="Plus">添加费用</el-button>
        </div>

        <el-table :data="form.expenseItems" style="width: 100%" border>
          <el-table-column label="日期" width="120">
            <template #default="{ row }">
              <el-date-picker
                v-model="row.date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="费用类型" width="150">
            <template #default="{ row }">
              <el-select v-model="row.category" placeholder="选择类型">
                <el-option label="交通费" value="transport" />
                <el-option label="住宿费" value="accommodation" />
                <el-option label="餐饮费" value="meal" />
                <el-option label="办公用品" value="office_supplies" />
                <el-option label="其他" value="other" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="金额" width="120">
            <template #default="{ row }">
              <el-input-number
                v-model="row.amount"
                :min="0"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="说明">
            <template #default="{ row }">
              <el-input v-model="row.description" placeholder="费用说明" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ $index }">
              <el-button type="danger" link :icon="Delete" @click="removeExpenseItem($index)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <!-- 金额汇总 -->
        <div class="total-amount">
          <span>合计金额：</span>
          <span class="amount">¥ {{ totalAmount }}</span>
        </div>
      </div>

      <!-- 附件上传 -->
      <div class="attachment-section">
        <h3>附件上传</h3>
        <el-upload
          action="#"
          multiple
          :file-list="form.attachments"
          :before-upload="beforeUpload"
          :on-remove="handleRemove"
          list-type="picture-card"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
        <div class="upload-tip">支持上传发票、凭证等图片，单文件不超过 10MB</div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { FormRules, UploadProps, UploadFile } from 'element-plus'
import { addApplication } from '@/utils/storage'
import { useRouter } from 'vue-router'
const router = useRouter()
const formRef = ref()

const form = reactive({
  type: '',
  reason: '',
  urgency: 'normal',
  expenseItems: [
    {
      date: '',
      category: '',
      amount: 0,
      description: '',
    },
  ],
  attachments: [],
})

const rules: FormRules = {
  type: [{ required: true, message: '请选择报销类型', trigger: 'change' }],
  reason: [{ required: true, message: '请输入申请事由', trigger: 'blur' }],
}

// 计算总金额
const totalAmount = computed(() => {
  return form.expenseItems.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)
})

// 添加费用项
const addExpenseItem = () => {
  form.expenseItems.push({
    date: '',
    category: '',
    amount: 0,
    description: '',
  })
}

// 删除费用项
const removeExpenseItem = (index: number) => {
  if (form.expenseItems.length > 1) {
    form.expenseItems.splice(index, 1)
  } else {
    ElMessage.warning('至少保留一条费用明细')
  }
}

// 文件上传前验证
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isJPGOrPNG) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!')
    return false
  }
  return false // 返回 false 手动处理上传
}

// 处理文件删除
const handleRemove: UploadProps['onRemove'] = (file) => {
  const index = form.attachments.findIndex((item: any) => item.uid === file.uid)
  if (index > -1) {
    form.attachments.splice(index, 1)
  }
}

// 提交申请
// 在 handleSubmit 方法中，替换模拟提交部分：

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (form.expenseItems.length === 0) {
      ElMessage.warning('请至少添加一条费用明细')
      return
    }

    if (totalAmount.value === '0.00') {
      ElMessage.warning('报销金额不能为0')
      return
    }

    const action = await ElMessageBox.confirm('确定提交报销申请吗？', '提示', {
      confirmButtonText: '提交申请',
      cancelButtonText: '保存草稿',
      type: 'warning',
    })
      .then(() => 'submit')
      .catch(() => 'draft')

    // 使用 localStorage 保存数据
    const applicationData = {
      type: form.type,
      reason: form.reason,
      urgency: form.urgency,
      expenseItems: form.expenseItems.map((item) => ({
        ...item,
        amount: Number(item.amount),
      })),
      totalAmount: Number(totalAmount.value),
      attachments: form.attachments,
      status: action === 'submit' ? 'pending' : 'draft', //根据选择设置状态
    }

    // 保存到本地存储
    const newApplication = addApplication(applicationData)

    ElMessage.success(action === 'submit' ? '提交成功，等待审批！' : '已保存为草稿')

    // 重置表单
    formRef.value.resetFields()
    form.expenseItems = [
      {
        date: '',
        category: '',
        amount: 0,
        description: '',
      },
    ]
    form.attachments = []

    // 跳转到申请列表
    router.push('/main/application/list')
  } catch (error) {
    console.log('操作取消:', error)
  }
}
</script>

<style scoped>
.create-application {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expense-section {
  margin: 24px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  color: #303133;
}

.total-amount {
  text-align: right;
  margin-top: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.amount {
  font-size: 20px;
  font-weight: bold;
  color: #e6a23c;
}

.attachment-section {
  margin-top: 24px;
}

.upload-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
