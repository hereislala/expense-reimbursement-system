// 本地存储管理工具
const STORAGE_KEYS = {
  APPLICATIONS: 'expense_applications',
  NEXT_ID: 'expense_next_id',
}

// 获取申请列表
export const getApplications = () => {
  const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS)
  return data ? JSON.parse(data) : []
}

// 保存申请列表
export const saveApplications = (applications: any[]) => {
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications))
}

// 添加新申请
export const addApplication = (application: any) => {
  const applications = getApplications()
  const nextId = getNextId()

  const newApplication = {
    ...application,
    id: nextId.toString(),
    applicationNo: `BX${new Date().getTime()}`, // 生成申请单号
    status: 'draft', // 默认草稿状态
    createTime: new Date().toLocaleString('zh-CN'),
    applicant: '张三', // 当前用户
    department: '技术部', // 当前用户部门
    urgency: application.urgency || 'normal',
    // 确保 expenseItems 有正确结构
    expenseItems: application.expenseItems.map((item: any) => ({
      date: item.date || '',
      category: item.category || '',
      amount: Number(item.amount) || 0,
      description: item.description || '',
    })),
    attachments: application.attachments || [],
  }

  applications.unshift(newApplication) // 新申请放在最前面
  saveApplications(applications)
  incrementNextId()

  return newApplication
}

// 更新申请
export const updateApplication = (id: string, updates: any) => {
  const applications = getApplications()
  const index = applications.findIndex((app: any) => app.id === id)

  if (index !== -1) {
    applications[index] = {
      ...applications[index],
      ...updates,
      id: applications[index].id,
      applicationNo: applications[index].applicationNo,
      status: applications[index].status,
      createTime: applications[index].createTime,
      applicant: applications[index].applicant,
      department: applications[index].department,
      urgency: applications[index].urgency,
      expenseItems: applications[index].expenseItems,
    }
    saveApplications(applications)
    return applications[index]
  }

  return null
}

// 删除申请
export const deleteApplication = (id: string) => {
  const applications = getApplications()
  const filteredApplications = applications.filter((app: any) => app.id !== id)
  saveApplications(filteredApplications)
}

// ID 管理
const getNextId = () => {
  const nextId = localStorage.getItem(STORAGE_KEYS.NEXT_ID)
  return nextId ? parseInt(nextId) : 1
}

const incrementNextId = () => {
  const nextId = getNextId() + 1
  localStorage.setItem(STORAGE_KEYS.NEXT_ID, nextId.toString())
}

// 初始化示例数据
export const initSampleData = () => {
  const existingData = localStorage.getItem(STORAGE_KEYS.APPLICATIONS)
  if (!existingData) {
    const sampleApplications = [
      {
        id: '1',
        applicationNo: 'BX202401150001',
        type: 'travel',
        reason: '北京出差参加会议交通住宿费用',
        totalAmount: 2850.0,
        status: 'approved',
        createTime: '2024-01-15 10:30:00',
        applicant: '张三',
        department: '技术部',
        urgency: 'normal',
        expenseItems: [
          { date: '2024-01-10', category: 'transport', amount: 650.0, description: '往返高铁票' },
          {
            date: '2024-01-10',
            category: 'accommodation',
            amount: 1200.0,
            description: '酒店住宿3晚',
          },
          { date: '2024-01-11', category: 'meal', amount: 300.0, description: '餐饮补贴' },
          {
            date: '2024-01-12',
            category: 'transport',
            amount: 700.0,
            description: '市内交通及出租车',
          },
        ],
      },
    ]
    saveApplications(sampleApplications)
    localStorage.setItem(STORAGE_KEYS.NEXT_ID, '2')
  }
}
