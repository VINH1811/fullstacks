const API_URLS = {
  // Mặc định dùng Vite proxy để tránh CORS khi chạy local tại http://localhost:5173.
  // Proxy thật được cấu hình trong frontend/vite.config.js.
  n1: import.meta.env.VITE_N1_API || '/n1-api',
  n2: import.meta.env.VITE_N2_API || '/n2-api',
  n3: import.meta.env.VITE_N3_API || '/n3-api',
}

export const apiUrls = API_URLS

function getToken() {
  return (
    localStorage.getItem('hrm_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    ''
  )
}

function joinUrl(base, path) {
  const cleanBase = String(base || '').replace(/\/$/, '')
  const cleanPath = String(path || '').startsWith('/') ? path : `/${path}`
  return `${cleanBase}${cleanPath}`
}

async function request(base, path, options = {}) {
  const token = getToken()

  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  }

  // Nếu gọi trực tiếp Dev Tunnels thì bỏ qua trang cảnh báo anti-phishing.
  // Khi dùng /n2-api hoặc /n3-api thì header này cũng đã được cấu hình ở vite.config.js.
  if (String(base).includes('devtunnels.ms')) {
    headers['X-Tunnel-Skip-AntiPhishing-Page'] = 'true'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const url = joinUrl(base, path)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 20000)

  let response
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`API quá lâu không phản hồi: ${url}`)
    }

    throw new Error(
      `Không kết nối được API: ${url}. Nếu bạn chạy local, hãy chắc chắn đang dùng npm run dev để Vite proxy hoạt động.`
    )
  } finally {
    clearTimeout(timeoutId)
  }

  const text = await response.text()
  let payload = null

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (typeof payload === 'string' && payload.toLowerCase().includes('you are about to connect to a developer tunnel')) {
    throw new Error('API Dev Tunnel đang bị chặn. Hãy mở link API trong trình duyệt và bấm Continue, hoặc dùng bản proxy này bằng npm run dev.')
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.Message ||
      payload?.title ||
      payload?.errors ||
      payload ||
      `HTTP ${response.status}`

    throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
  }

  return payload
}

// Tải file nhị phân (Excel/PDF) — fetch kèm Bearer token rồi kích hoạt download.
// Không dùng window.open vì endpoint yêu cầu Authorization header.
async function downloadFile(base, path, fallbackName = 'download') {
  const token = getToken()
  const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  if (String(base).includes('devtunnels.ms')) {
    headers['X-Tunnel-Skip-AntiPhishing-Page'] = 'true'
  }

  const url = joinUrl(base, path)
  const response = await fetch(url, { headers })

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const data = await response.json()
      message = data?.message || data?.Message || message
    } catch { /* body không phải JSON */ }
    throw new Error(message)
  }

  // Lấy tên file từ header Content-Disposition nếu backend có gửi
  let filename = fallbackName
  const disposition = response.headers.get('Content-Disposition') || ''
  const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)/i)
  if (match) filename = decodeURIComponent(match[1])

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}

function qs(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value)
    }
  })

  const value = query.toString()
  return value ? `?${value}` : ''
}

export const authApi = {
  login: (data) =>
    request(API_URLS.n1, '/Auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data) =>
    request(API_URLS.n1, '/Auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createRole: (roleName) =>
    request(API_URLS.n1, '/Auth/create-role', {
      method: 'POST',
      body: JSON.stringify(roleName),
    }),

  users: {
    list: () => request(API_URLS.n1, '/Auth/users'),

    update: (id, data) =>
      request(API_URLS.n1, `/Auth/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    remove: (id) =>
      request(API_URLS.n1, `/Auth/users/${id}`, {
        method: 'DELETE',
      }),
  },
}

export const hrApi = {
  employees: {
    list: (params = {}) =>
      request(API_URLS.n1, `/Employees${qs({ page: 1, pageSize: 1000, ...params })}`),

    get: (id) => request(API_URLS.n1, `/Employees/${id}`),

    create: (data) =>
      request(API_URLS.n1, '/Employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    createWithAccount: (data) =>
      request(API_URLS.n1, '/Employees/create-with-account', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      request(API_URLS.n1, `/Employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    remove: (id) =>
      request(API_URLS.n1, `/Employees/${id}`, {
        method: 'DELETE',
      }),
  },

  departments: {
    list: () => request(API_URLS.n1, '/Departments'),

    stats: () => request(API_URLS.n1, '/Departments/stats'),

    create: (data) =>
      request(API_URLS.n1, '/Departments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      request(API_URLS.n1, `/Departments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    remove: (id) =>
      request(API_URLS.n1, `/Departments/${id}`, {
        method: 'DELETE',
      }),
  },

  contracts: {
    list: () => request(API_URLS.n1, '/Contracts'),

    activeByEmployee: (employeeId) =>
      request(API_URLS.n1, `/Contracts/employee/${employeeId}`),

    create: (data) =>
      request(API_URLS.n1, '/Contracts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      request(API_URLS.n1, `/Contracts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    remove: (id) =>
      request(API_URLS.n1, `/Contracts/${id}`, {
        method: 'DELETE',
      }),
  },
}

export const attendanceApi = {
  records: {
    list: (params = {}) => request(API_URLS.n2, `/Attendances${qs(params)}`),

    checkIn: (employeeId, options = {}) =>
      request(API_URLS.n2, '/Attendances/check-in', {
        method: 'POST',
        body: JSON.stringify({
          employeeId,
          checkInMethod: options.checkInMethod || 'Manual',
          checkInPhotoUrl: options.checkInPhotoUrl || null,
        }),
      }),

    checkOut: (employeeId) =>
      request(API_URLS.n2, '/Attendances/check-out', {
        method: 'POST',
        body: JSON.stringify({ employeeId }),
      }),

    manual: (data) =>
      request(API_URLS.n2, '/Attendances/manual', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    monthlyClose: (month, year) =>
      request(API_URLS.n2, `/Attendances/monthly-close${qs({ month, year })}`),

    remove: (id) =>
      request(API_URLS.n2, `/Attendances/${id}`, {
        method: 'DELETE',
      }),
  },

  leaves: {
    list: () => request(API_URLS.n2, '/LeaveRequests'),

    byEmployee: (employeeId) =>
      request(API_URLS.n2, `/LeaveRequests/employee/${employeeId}`),

    create: (data) =>
      request(API_URLS.n2, '/LeaveRequests', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      request(API_URLS.n2, `/LeaveRequests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    approve: (id, status) =>
      request(API_URLS.n2, `/LeaveRequests/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),

    remove: (id) =>
      request(API_URLS.n2, `/LeaveRequests/${id}`, {
        method: 'DELETE',
      }),
  },
}

export const payrollApi = {
  // Đồng bộ nhân sự + lương cơ bản: N3 tự gọi sang N1 (SyncController)
  sync: {
    hrCore: () => request(API_URLS.n3, '/Sync/hr-core', { method: 'POST' }),
    preview: () => request(API_URLS.n3, '/Sync/hr-core-preview'),
    localStatus: () => request(API_URLS.n3, '/Sync/local-status'),
  },

  salaryConfigs: {
    list: () => request(API_URLS.n3, '/SalaryConfigs'),

    save: (data) =>
      request(API_URLS.n3, '/SalaryConfigs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  allowances: {
    byEmployee: (employeeId) =>
      request(API_URLS.n3, `/AllowanceDeductions/employee/${employeeId}`),

    create: (data) =>
      request(API_URLS.n3, '/AllowanceDeductions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    remove: (id) =>
      request(API_URLS.n3, `/AllowanceDeductions/${id}`, {
        method: 'DELETE',
      }),
  },

  payslips: {
    // Danh sách theo tháng (có thể lọc theo trạng thái)
    list: (monthYear, status) =>
      request(API_URLS.n3, `/MonthlyPayslips/month/${monthYear}${qs({ status })}`),

    // Tính lương tự động: N3 tự kéo công từ N2 rồi tính
    calculateFromAttendance: (month, year, monthYear) =>
      request(
        API_URLS.n3,
        `/MonthlyPayslips/calculate-from-attendance${qs({ month, year, monthYear })}`,
        { method: 'POST' },
      ),

    // Tính lương từ danh sách chấm công truyền lên (dự phòng)
    batchCalculate: (data) =>
      request(API_URLS.n3, '/MonthlyPayslips/batch-calculate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    byEmployee: (employeeId, monthYear) =>
      request(API_URLS.n3, `/MonthlyPayslips/employee/${employeeId}/${monthYear}`),

    update: (id, data) =>
      request(API_URLS.n3, `/MonthlyPayslips/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    approve: (id) =>
      request(API_URLS.n3, `/MonthlyPayslips/${id}/approve`, { method: 'PUT' }),

    reject: (id, reason) =>
      request(API_URLS.n3, `/MonthlyPayslips/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      }),

    approveMonth: (monthYear) =>
      request(API_URLS.n3, `/MonthlyPayslips/approve-month/${monthYear}`, { method: 'PUT' }),

    unapproveMonth: (monthYear) =>
      request(API_URLS.n3, `/MonthlyPayslips/unapprove-month/${monthYear}`, { method: 'PUT' }),

    departmentSummary: (monthYear) =>
      request(API_URLS.n3, `/MonthlyPayslips/department-summary/${monthYear}`),

    sendEmails: (monthYear) =>
      request(API_URLS.n3, `/MonthlyPayslips/send-emails/${monthYear}`, {
        method: 'POST',
      }),

    remove: (id) =>
      request(API_URLS.n3, `/MonthlyPayslips/${id}`, {
        method: 'DELETE',
      }),
  },

  // Xuất báo cáo (tải file kèm token)
  reports: {
    excel: (monthYear) =>
      downloadFile(API_URLS.n3, `/Reports/excel/${monthYear}`, `BangLuong_${monthYear}.xlsx`),

    pdfSummary: (monthYear) =>
      downloadFile(API_URLS.n3, `/Reports/pdf-summary/${monthYear}`, `BangLuongTongHop_${monthYear}.pdf`),

    pdfEmployee: (employeeId, monthYear) =>
      downloadFile(
        API_URLS.n3,
        `/Reports/pdf/${employeeId}/${monthYear}`,
        `PhieuLuong_${employeeId}_${monthYear}.pdf`,
      ),
  },

  dashboard: {
    summary: (monthYear) => request(API_URLS.n3, `/Dashboard/summary/${monthYear}`),
  },
}

export function unwrapEmployees(response) {
  if (Array.isArray(response)) return response
  return response?.data || response?.Data || response?.items || response?.Items || []
}

export function unwrapToken(response) {
  return (
    response?.token ||
    response?.Token ||
    response?.accessToken ||
    response?.AccessToken ||
    response?.jwt ||
    response?.Jwt ||
    response?.data?.token ||
    response?.data?.Token ||
    response?.data?.accessToken ||
    ''
  )
}

export function unwrapRoles(response) {
  const roles =
    response?.roles ||
    response?.Roles ||
    response?.user?.roles ||
    response?.User?.Roles ||
    response?.data?.roles ||
    response?.data?.Roles ||
    []

  if (Array.isArray(roles)) return roles
  if (typeof roles === 'string') return [roles]
  return []
}

export function toPayrollReplica(employee) {
  return {
    employeeId: employee.employeeId || employee.id || employee.EmployeeId || employee.Id,
    employeeCode: employee.employeeCode || employee.code || employee.EmployeeCode || '',
    fullName: employee.fullName || employee.fullname || employee.name || employee.FullName || '',
    email: employee.email || employee.Email || '',
    departmentName:
      employee.departmentName ||
      employee.DepartmentName ||
      employee.department?.departmentName ||
      employee.department?.name ||
      employee.Department?.DepartmentName ||
      'Chưa phân bổ',
    contractType: employee.contractType || employee.ContractType || 'Chính thức',
    jobTitle: employee.jobTitle || employee.JobTitle || employee.position || 'Nhân viên',
  }
}
