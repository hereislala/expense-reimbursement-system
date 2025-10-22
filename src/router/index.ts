import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/main',
      component: () => import('@/layouts/DefaultLayout.vue'),
      redirect: '/main/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: 'application/create',
          name: 'CreateApplication',
          component: () => import('@/views/application/CreateApplication.vue')
        },
        {
          path: 'application/list',
          name: 'ApplicationList',
          component: () => import('@/views/application/ApplicationList.vue')
        },
        {
          path: 'approval',
          name: 'ApprovalList',
          component: () => import('@/views/approval/ApprovalList.vue')
        },
        {
          path: 'statistics',
          name: 'Statistics',
          component: () => import('@/views/Statistics.vue')
        }
      ]
    }
  ]
})

// 简化路由守卫
router.beforeEach((to, from, next) => {
  console.log('路由导航:', to.path)
  
  // 如果是访问根路径，跳转到登录页
  if (to.path === '/') {
    next('/login')
    return
  }
  
  next()
})

export default router