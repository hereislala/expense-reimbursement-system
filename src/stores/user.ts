import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const id = ref('1')
  const name = ref('张三')
  const avatar = ref('')
  const department = ref('技术部')
  const role = ref('manager') // 改为manager，表示有审批权限

  const setUserInfo = (userInfo: any) => {
    id.value = userInfo.id
    name.value = userInfo.name
    avatar.value = userInfo.avatar
    department.value = userInfo.department
    role.value = userInfo.role
  }

  return {
    id,
    name,
    avatar,
    department,
    role,
    setUserInfo,
  }
})
