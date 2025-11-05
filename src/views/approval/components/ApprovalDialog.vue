<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :before-close="handleClose">
    <!-- 审批通过 -->
    <div v-if="action === 'approve'">
      <el-alert
        title="确定要通过此申请吗？"
        type="success"
        :closable="false"
        style="margin-bottom: 20px"
      />

      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="审批意见" prop="comment">
          <el-input
            v-model="form.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入审批意见（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 审批驳回 -->
    <div v-else-if="action === 'reject'">
      <el-alert
        title="确定要驳回此申请吗？"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
      />

      <el-form :model="form" :rules="rejectRules" ref="formRef" label-width="80px">
        <el-form-item label="驳回原因" prop="comment">
          <el-input
            v-model="form.comment"
            type="textarea"
            :rows="3"
            placeholder="请详细说明驳回原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 转交审批 -->
    <div v-else-if="action === 'transfer'">
      <el-alert
        title="将审批任务转交给其他审批人"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      />

      <el-form :model="form" :rules="transferRules" ref="formRef" label-width="80px">
        <el-form-item label="转交对象" prop="transferTo">
          <el-select v-model="form.transferTo" placeholder="请选择审批人" style="width: 100%">
            <el-option label="王总监" value="wang" />
            <el-option label="刘经理" value="liu" />
            <el-option label="陈主管" value="chen" />
          </el-select>
        </el-form-item>

        <el-form-item label="转交说明" prop="comment">
          <el-input
            v-model="form.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入转交说明（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">
          {{ confirmButtonText }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules } from 'element-plus'
// 导入审批方法
import { approveApplication, rejectApplication, transferApplication } from '@/utils/storage'

interface Props {
  modelValue: boolean
  application: any
  action: 'approve' | 'reject' | 'transfer'
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'success'])

const formRef = ref()
const loading = ref(false)

const form = reactive({
  comment: '',
  transferTo: '',
})

const rules = {
  comment: [{ max: 200, message: '审批意见不能超过200个字符', trigger: 'blur' }],
}

const rejectRules = {
  comment: [
    { required: true, message: '请输入驳回原因', trigger: 'blur' },
    { max: 200, message: '驳回原因不能超过200个字符', trigger: 'blur' },
  ],
}

const transferRules = {
  transferTo: [{ required: true, message: '请选择转交对象', trigger: 'change' }],
  comment: [{ max: 200, message: '转交说明不能超过200个字符', trigger: 'blur' }],
}

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const dialogTitle = computed(() => {
  const titles: any = {
    approve: '审批通过',
    reject: '审批驳回',
    transfer: '转交审批',
  }
  return titles[props.action] || '审批操作'
})

const confirmButtonText = computed(() => {
  const texts: any = {
    approve: '通过',
    reject: '驳回',
    transfer: '转交',
  }
  return texts[props.action] || '确认'
})

// 方法
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  form.comment = ''
  form.transferTo = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const handleConfirm = async () => {
  if (!formRef.value) return

  try {
    // 表单验证
    await formRef.value.validate()
    loading.value = true

    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 500))
    let result

    //根据操作类型调用不同的方法
    switch (props.action) {
      case 'approve':
        result = await approveApplication(props.application?.id, form.comment)
        break
      case 'reject':
        result = await rejectApplication(props.application?.id, form.comment)
        break
      case 'transfer':
        result = await transferApplication(props.application?.id, form.transferTo, form.comment)
        break
    }
    if (result) {
      ElMessage.success(`${confirmButtonText.value}成功`)
      handleClose()
      emit('success')
    } else {
      ElMessage.error(`操作失败`)
    }
  } catch (error) {
    console.log('操作失败:', error)
    ElMessage.error(`操作失败`)
  } finally {
    loading.value = false
  }
}

// 监听对话框显示状态
watch(dialogVisible, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
