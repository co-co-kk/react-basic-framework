// import { api } from "../../api";
// import { BASE_URL_API } from "@/customization/config-constants";
import { getLocalUserInfo } from '@/utils/utils';

import api from '@/api/index';
//get拼接字符串
const buildQueryString: any = (params: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) return '';

  return Object.entries(params)
    .map(([key, value]) => {
      if (value === null || value === undefined) return '';
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .filter(Boolean)
    .join('&');
};

/** 获取授权菜单 */
export const getAuthMenu = () => {
  return api.get('/api/platform/oauth/authMenu');
};

/** 获取菜单权限
 * 后台管理系统	tianshu_ai_backend
 * 数智小新AI	tianshu_ai_frontend
 */
export function getMenuTree(params: any) {
  const userInfo: any = getLocalUserInfo();
  return api.get(`/api/platform/admin/v1/menu/tree?appCode=${params}&appVersion=${userInfo.appVersion}`);
}

// 获取按钮权限
export function getPermissions(appCode: string) {
  return api.get(`/api/platform/admin/v1/resource/permissions?appCode=${appCode}`);
}

// 查询菜单最近使用
export function getRecentlyUsed() {
  return api.get('/api/platform/admin/v1/menu/useApp/list');
}

// 保存菜单最近使用
export function saveRecentlyUsed(code: string) {
  return api.post('/api/platform/admin/v1/menu/useApp/sava?menuCode=' + code);
}
