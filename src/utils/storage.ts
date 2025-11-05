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
// 初始化示例数据
export const initSampleData = () => {
  const existingData = localStorage.getItem(STORAGE_KEYS.APPLICATIONS)
  console.log('初始化数据检查 - 现有数据:', existingData)

  if (!existingData) {
    console.log('创建示例数据...')
    const sampleApplications = [
      {
        id: '1',
        applicationNo: 'BX202401150001',
        type: 'travel',
        reason: '北京出差参加会议交通住宿费用',
        totalAmount: 2850.0,
        status: 'pending', // 待审批
        createTime: '2024-01-15 10:30:00',
        applicant: '李四', // 申请人不是张三
        department: '销售部',
        urgency: 'normal',
        currentApprover: '张三', // 当前审批人是张三
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
        approvalHistory: [
          { time: '2024-01-15 10:30:00', approver: '李四', action: 'submit', comment: '' },
        ],
      },
      {
        id: '2',
        applicationNo: 'BX202401140002',
        type: 'office',
        reason: '采购办公用品及打印机耗材',
        totalAmount: 1200.5,
        status: 'pending', // 待审批
        createTime: '2024-01-14 16:20:00',
        applicant: '王五', // 申请人不是张三
        department: '市场部',
        urgency: 'normal',
        currentApprover: '张三', // 当前审批人是张三
        expenseItems: [
          {
            date: '2024-01-14',
            category: 'office_supplies',
            amount: 800.0,
            description: '打印机墨盒',
          },
          {
            date: '2024-01-14',
            category: 'office_supplies',
            amount: 400.5,
            description: '办公文具',
          },
        ],
        approvalHistory: [
          { time: '2024-01-14 16:20:00', approver: '王五', action: 'submit', comment: '' },
        ],
      },
      {
        id: '3',
        applicationNo: 'BX202401130003',
        type: 'entertainment',
        reason: '客户接待餐饮费用',
        totalAmount: 800.0,
        status: 'pending', // 待审批
        createTime: '2024-01-13 09:15:00',
        applicant: '赵六', // 申请人不是张三
        department: '产品部',
        urgency: 'urgent',
        currentApprover: '张三', // 当前审批人是张三
        expenseItems: [
          { date: '2024-01-12', category: 'meal', amount: 800.0, description: '客户晚餐接待' },
        ],
        approvalHistory: [
          { time: '2024-01-13 09:15:00', approver: '赵六', action: 'submit', comment: '' },
        ],
      },
    ]
    saveApplications(sampleApplications)
    localStorage.setItem(STORAGE_KEYS.NEXT_ID, '4')
    console.log('示例数据创建完成')
  } else {
    console.log('使用现有数据')
  }
}
//添加审批相关方法
// 添加审批相关的方法
export const getApprovalApplications = () => {
  const applications = getApplications()
  console.log('getApprovalApplications - 所有申请:', applications)

  // 返回待审批和已审批的申请（排除草稿状态）
  const approvalApps = applications.filter((app: any) => app.status !== 'draft')
  console.log('getApprovalApplications - 审批相关申请:', approvalApps)

  return approvalApps
}

// 审批操作
export const approveApplication = (
  id: string,
  comment: string = '',
  approver: string = '李经理',
) => {
  const applications = getApplications()
  const index = applications.findIndex((app: any) => app.id === id)

  if (index !== -1) {
    // 更新申请状态
    applications[index].status = 'approved'

    // 添加审批记录
    if (!applications[index].approvalHistory) {
      applications[index].approvalHistory = []
    }

    applications[index].approvalHistory.push({
      time: new Date().toLocaleString('zh-CN'),
      approver: approver,
      action: 'approve',
      comment: comment,
    })

    saveApplications(applications)
    return applications[index]
  }

  return null
}

// 驳回操作
export const rejectApplication = (id: string, comment: string, approver: string = '李经理') => {
  const applications = getApplications()
  const index = applications.findIndex((app: any) => app.id === id)

  if (index !== -1) {
    // 更新申请状态
    applications[index].status = 'rejected'
    applications[index].rejectReason = comment

    // 添加审批记录
    if (!applications[index].approvalHistory) {
      applications[index].approvalHistory = []
    }

    applications[index].approvalHistory.push({
      time: new Date().toLocaleString('zh-CN'),
      approver: approver,
      action: 'reject',
      comment: comment,
    })

    saveApplications(applications)
    return applications[index]
  }

  return null
}

// 转交操作
export const transferApplication = (
  id: string,
  transferTo: string,
  comment: string = '',
  approver: string = '李经理',
) => {
  const applications = getApplications()
  const index = applications.findIndex((app: any) => app.id === id)

  if (index !== -1) {
    // 添加转交记录
    if (!applications[index].approvalHistory) {
      applications[index].approvalHistory = []
    }

    applications[index].approvalHistory.push({
      time: new Date().toLocaleString('zh-CN'),
      approver: approver,
      action: 'transfer',
      comment: comment,
      transferTo: transferTo,
    })

    // 更新当前审批人（在实际系统中这里会有更复杂的逻辑）
    applications[index].currentApprover = transferTo

    saveApplications(applications)
    return applications[index]
  }

  return null
}
