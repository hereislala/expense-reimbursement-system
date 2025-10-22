<template>
  <div class="expense-welcome">
    <div class="welcome-header">
      <h1>费用报销系统</h1>
      <p>高效管理您的企业费用报销流程</p>
    </div>

    <div class="feature-cards">
      <div class="feature-card">
        <div class="feature-icon">📝</div>
        <h3>报销申请</h3>
        <p>快速提交日常费用报销申请</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">✅</div>
        <h3>审批流程</h3>
        <p>多级审批机制，流程规范透明</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>数据统计</h3>
        <p>实时查看报销数据分析报告</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h3>快速处理</h3>
        <p>简化流程，提高工作效率</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TheWelcome'
}
</script>

<style scoped>
.expense-welcome {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.welcome-header {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.welcome-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}
</style>