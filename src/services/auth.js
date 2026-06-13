export const AUTH_KEYS = {
  token: 'hrm_token',
  username: 'hrm_username',
  roles: 'hrm_roles',
  employeeId: 'hrm_employee_id',
  employeeCode: 'hrm_employee_code',
  fullName: 'hrm_full_name',
  expiration: 'hrm_token_expiration',
}

const ROLE_ORDER = ['Admin', 'HR', 'Employee']
const ROLE_ALIASES = {
  admin: 'Admin',
  administrator: 'Admin',
  hr: 'HR',
  humanresources: 'HR',
  human_resource: 'HR',
  employee: 'Employee',
  staff: 'Employee',
  user: 'Employee',
}

function base64UrlDecode(value = '') {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    return decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    )
  } catch {
    return ''
  }
}

export function decodeJwt(token = '') {
  const parts = String(token).split('.')
  if (parts.length < 2) return {}
  try {
    return JSON.parse(base64UrlDecode(parts[1]) || '{}')
  } catch {
    return {}
  }
}

function normalizeRole(role) {
  const value = String(role || '').trim()
  if (!value) return ''
  const key = value.replace(/[^a-zA-Z]/g, '').toLowerCase()
  return ROLE_ALIASES[key] || value
}

function normalizeRoles(input) {
  const raw = Array.isArray(input) ? input : input ? [input] : []
  const roles = raw.map(normalizeRole).filter(Boolean)
  return [...new Set(roles)].sort((a, b) => ROLE_ORDER.indexOf(a) - ROLE_ORDER.indexOf(b))
}

function lookupEmployeeFromDirectory(employeeId = '') {
  if (!employeeId) return {}
  try {
    const directory = JSON.parse(localStorage.getItem('hrm_employee_directory_v13') || '{}')
    return directory[employeeId] || {}
  } catch {
    return {}
  }
}

function extractRoles(payload = {}, decoded = {}) {
  const roleClaim = decoded.role || decoded.roles || decoded.Roles || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
  const roles =
    payload?.roles ||
    payload?.Roles ||
    payload?.role ||
    payload?.Role ||
    payload?.user?.roles ||
    payload?.User?.Roles ||
    payload?.data?.roles ||
    payload?.data?.Roles ||
    payload?.data?.role ||
    roleClaim ||
    []

  const normalized = normalizeRoles(roles)
  return normalized.length ? normalized : ['Employee']
}

function extractEmployeeId(payload = {}, decoded = {}) {
  return String(
    payload?.employeeId ||
      payload?.EmployeeId ||
      payload?.user?.employeeId ||
      payload?.User?.EmployeeId ||
      payload?.data?.employeeId ||
      payload?.data?.EmployeeId ||
      decoded.EmployeeId ||
      decoded.employeeId ||
      decoded.employee_id ||
      '',
  )
}

function extractEmployeeCode(payload = {}, decoded = {}) {
  return String(
    payload?.employeeCode ||
      payload?.EmployeeCode ||
      payload?.user?.employeeCode ||
      payload?.User?.EmployeeCode ||
      payload?.data?.employeeCode ||
      payload?.data?.EmployeeCode ||
      decoded.EmployeeCode ||
      decoded.employeeCode ||
      '',
  )
}

function extractFullName(payload = {}, decoded = {}) {
  return String(
    payload?.fullName ||
      payload?.FullName ||
      payload?.user?.fullName ||
      payload?.User?.FullName ||
      payload?.data?.fullName ||
      payload?.data?.FullName ||
      decoded.FullName ||
      decoded.fullName ||
      '',
  )
}

function extractUsername(payload = {}, decoded = {}, fallback = '') {
  return String(
    fallback ||
      payload?.username ||
      payload?.Username ||
      payload?.userName ||
      payload?.UserName ||
      payload?.data?.username ||
      decoded.unique_name ||
      decoded.name ||
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      '',
  )
}

export function saveAuth(payload, username = '') {
  const token =
    payload?.token ||
    payload?.Token ||
    payload?.accessToken ||
    payload?.AccessToken ||
    payload?.jwt ||
    payload?.Jwt ||
    payload?.data?.token ||
    payload?.data?.Token ||
    payload?.data?.accessToken ||
    ''

  if (!token) throw new Error('Backend không trả về JWT token')

  const decoded = decodeJwt(token)
  const roles = extractRoles(payload, decoded)
  const employeeId = extractEmployeeId(payload, decoded)
  const employeeCode = extractEmployeeCode(payload, decoded)
  const fullName = extractFullName(payload, decoded)
  const responseExpiration =
    payload?.expiration ||
    payload?.Expiration ||
    payload?.expiresAt ||
    payload?.ExpiresAt ||
    payload?.data?.expiration ||
    ''
  const expiration = responseExpiration || (decoded.exp ? new Date(decoded.exp * 1000).toISOString() : '')
  const resolvedUsername = extractUsername(payload, decoded, username)

  localStorage.setItem(AUTH_KEYS.token, token)
  localStorage.setItem(AUTH_KEYS.username, resolvedUsername)
  localStorage.setItem(AUTH_KEYS.roles, JSON.stringify(roles))
  localStorage.setItem(AUTH_KEYS.employeeId, employeeId || '')
  localStorage.setItem(AUTH_KEYS.employeeCode, employeeCode || '')
  localStorage.setItem(AUTH_KEYS.fullName, fullName || '')
  localStorage.setItem(AUTH_KEYS.expiration, expiration || '')

  localStorage.setItem('token', token)
  localStorage.setItem('accessToken', token)
  localStorage.setItem('role', roles[0] || 'Employee')
  localStorage.setItem(
    'user',
    JSON.stringify({ username: resolvedUsername, roles, role: roles[0] || 'Employee', employeeId, employeeCode, fullName }),
  )
}

export function clearAuth() {
  Object.values(AUTH_KEYS).forEach((key) => localStorage.removeItem(key))
  localStorage.removeItem('token')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
}

export function getAuthUser() {
  let roles = []
  try {
    roles = JSON.parse(localStorage.getItem(AUTH_KEYS.roles) || '[]')
  } catch {
    roles = []
  }

  if (!roles.length) roles = normalizeRoles(localStorage.getItem('role'))

  const employeeId = localStorage.getItem(AUTH_KEYS.employeeId) || ''
  const fromDirectory = lookupEmployeeFromDirectory(employeeId)
  const employeeCode = localStorage.getItem(AUTH_KEYS.employeeCode) || fromDirectory.employeeCode || ''
  const fullName = localStorage.getItem(AUTH_KEYS.fullName) || fromDirectory.fullName || ''

  return {
    token: localStorage.getItem(AUTH_KEYS.token) || localStorage.getItem('token') || '',
    username: localStorage.getItem(AUTH_KEYS.username) || '',
    roles: normalizeRoles(roles),
    role: normalizeRoles(roles)[0] || 'Employee',
    employeeId,
    employeeCode,
    fullName,
    expiration: localStorage.getItem(AUTH_KEYS.expiration) || '',
  }
}

export function isAuthenticated() {
  const user = getAuthUser()
  if (!user.token) return false
  if (!user.expiration) return true

  const expiresAt = new Date(user.expiration).getTime()
  if (Number.isNaN(expiresAt)) return true

  if (expiresAt <= Date.now()) {
    clearAuth()
    return false
  }

  return true
}

export function hasAnyRole(requiredRoles = []) {
  if (!requiredRoles.length) return true
  const userRoles = getAuthUser().roles.map((role) => String(role).toLowerCase())
  return requiredRoles.some((role) => userRoles.includes(String(role).toLowerCase()))
}

export function isAdmin() {
  return hasAnyRole(['Admin'])
}

export function isHR() {
  return hasAnyRole(['HR'])
}

export function isEmployee() {
  return hasAnyRole(['Employee'])
}

export function isAdminOrHR() {
  return hasAnyRole(['Admin', 'HR'])
}

export function isEmployeeOnly() {
  const roles = getAuthUser().roles
  return roles.length === 1 && roles[0] === 'Employee'
}

export function canManageSystem() {
  return isAdmin()
}

export function canManagePeople() {
  return isAdminOrHR()
}

export function canManageAttendance() {
  return isAdminOrHR()
}

export function canManagePayroll() {
  return isAdminOrHR()
}

export function canApproveLeave() {
  return isAdminOrHR()
}

export function canActOnEmployee(employeeId) {
  if (isAdminOrHR()) return true
  return String(employeeId || '') === String(getAuthUser().employeeId || '')
}

export function requireOwnEmployeeId() {
  const employeeId = getAuthUser().employeeId
  if (!employeeId) throw new Error('Tài khoản Employee chưa được gắn EmployeeId. Admin cần tạo/gắn tài khoản với đúng nhân viên.')
  return employeeId
}
