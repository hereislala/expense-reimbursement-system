<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">5</div>
              <div class="stat-label">待审批</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon approved">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">12</div>
              <div class="stat-label">已通过</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon rejected">
              <el-icon><Close /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">2</div>
              <div class="stat-label">已驳回</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥8,650</div>
              <div class="stat-label">累计报销</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card header="快捷操作">
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/application/create')">
              <el-icon><Plus /></el-icon>
              新建报销
            </el-button>
            <el-button @click="$router.push('/application/list')">
              <el-icon><List /></el-icon>
              我的申请
            </el-button>
            <el-button @click="$router.push('/approval')">
              <el-icon><Check /></el-icon>
              待我审批
            </el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="最新动态">
          <el-timeline>
            <el-timeline-item
              v-for="item in activities"
              :key="item.id"
              :timestamp="item.time"
            >
              {{ item.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activities = ref([
  {
    id: 1,
    time: '2024-01-15 10:30',
    content: '差旅费报销单已提交审批'
  },
  {
    id: 2,
    time: '2024-01-14 16:20',
    content: '办公用品采购报销已通过'
  },
  {
    id: 3,
    time: '2024-01-13 09:15',
    content: '客户招待费用报销待补充材料'
  }
])
</script>

<style scoped>
.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.stat-icon.pending { background: #e6a23c; }
.stat-icon.approved { background: #67c23a; }
.stat-icon.rejected { background: #f56c6c; }
.stat-icon.total { background: #409eff; }

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  color: #909399;
  margin-top: 4px;
}

.quick-actions {
  display: flex;
  gap: 12px;
}
</style>