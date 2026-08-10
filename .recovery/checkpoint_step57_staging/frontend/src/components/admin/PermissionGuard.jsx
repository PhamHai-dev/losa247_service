import { Result } from 'antd'
import { useAuthStore } from '../../stores/authStore'

export function PermissionGuard({ permission, any = [], children, fallback }) {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const allowed = permission ? hasPermission(permission) : any.some(hasPermission)
  if (allowed) return children
  return fallback ?? <Result status="403" title="403" subTitle="Bạn không có quyền truy cập chức năng này." />
}