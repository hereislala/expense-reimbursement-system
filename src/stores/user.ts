import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const id = ref('')
  const name = ref('')
  const avatar = ref('')
  const department = ref('')
  const role = ref('') // 'employee', 'manager', 'finance'

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
    setUserInfo
  }
})