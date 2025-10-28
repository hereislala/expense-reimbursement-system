import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/main',
      component: () => import('../layouts/DefaultLayout.vue'),
      redirect: '/main/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue'),
        },
        {
          path: 'application/create',
          name: 'CreateApplication',
          component: () => import('../views/application/CreateApplication.vue'),
        },
        {
          path: 'application/list',
          name: 'ApplicationList',
          component: () => import('../views/application/ApplicationList.vue'),
        },
        {
          path: 'approval',
          name: 'ApprovalList',
          component: () => import('../views/approval/ApprovalList.vue'),
        },
        {
          path: 'statistics',
          name: 'Statistics',
          component: () => import('../views/Statistics.vue'),
        },
        {
          path: 'approval/detail/:id',
          name: 'ApprovalDetail',
          component: () => import('@/views/approval/ApprovalDetail.vue'),
        },
        {
          path: 'application/detail/:id',
          name: 'ApplicationDetail',
          component: () => import('@/views/application/ApplicationDetail.vue'),
          props: true, // 添加这行，让路由参数作为 props 传递
        },
        {
          path: 'application/edit/:id',
          name: 'EditApplication',
          component: () => import('@/views/application/EditApplication.vue'),
        },
      ],
    },
  ],
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
