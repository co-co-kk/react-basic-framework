import React, { useMemo } from 'react';
import { usePermissionStore } from '@/stores/permissionStore';
import { useLocation, useParams } from "react-router-dom";
// 导出权限检查函数（通过状态管理）
interface PermissionButtonProps {
  permission?: string; // 使permission变为可选
  children: React.ReactNode;
  routePermissions?: Record<string, string>; // 路由特定权限配置
}
const PermissionButton: React.FC<PermissionButtonProps> = ({
  permission,
  children,
  routePermissions
}) => {
  const isPermissionLoaded = usePermissionStore(state => state.isPermissionLoaded);
  const location = useLocation();
  let buttonPermission = usePermissionStore(state => state.buttonPermission) || JSON.parse(localStorage.getItem('buttonPermission') || '[]');

  // 检查是否有权限（支持模糊匹配）
  const hasPermission = React.useMemo(() => {
    if (!isPermissionLoaded) return false;

    // 如果提供了路由特定权限配置，则根据当前路径使用对应的权限
    let effectivePermission = permission;
    if (routePermissions) {
      const currentPath = location.pathname;
      // 首先尝试精确匹配
      if (routePermissions[currentPath]) {
        effectivePermission = routePermissions[currentPath];
      } else {
        // 如果没有精确匹配，尝试部分匹配
        for (const [routePattern, routePermission] of Object.entries(routePermissions)) {
          // 使用更精确的路径匹配逻辑
          if (currentPath.includes(routePattern) || currentPath.startsWith(routePattern)) {
            effectivePermission = routePermission;
            break;
          }
        }
      }
    }

    // 如果没有找到有效的权限，则返回false
    if (!effectivePermission) return false;

    if (!buttonPermission?.length) return false;

    // 精确匹配
    if (buttonPermission.includes(effectivePermission)) return true;

    // 模糊匹配（如：assistant:*）
    return buttonPermission.some(p => {
      if (p.endsWith(':*')) {
        const basePerm = p.slice(0, -2);
        return effectivePermission.startsWith(basePerm);
      }
      return false;
    });
  }, [buttonPermission, permission, isPermissionLoaded, location.pathname, routePermissions]);

  // console.log('buttonPermission==>buttonPermission', buttonPermission, JSON.stringify(isPermissionLoaded));
  // console.log(hasPermission,'knowledge:local:chunk:edit==>', routePermissions, permission);


  return hasPermission ? <>{children}</> : null;
};

export default React.memo(PermissionButton);

export const checkPermission = (requiredPermission: string): boolean => {
  const { buttonPermission, isPermissionLoaded } = usePermissionStore.getState();

  if (!isPermissionLoaded) return false;

  // 精确匹配
  if (buttonPermission?.includes(requiredPermission)) return true;

  // 模糊匹配（如：assistant:*）
  return buttonPermission?.some(p => {
    if (p.endsWith(':*')) {
      const basePerm = p.slice(0, -2);
      return requiredPermission.startsWith(basePerm);
    }
    return false;
  }) ?? false;
};
