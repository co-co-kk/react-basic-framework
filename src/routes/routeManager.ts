import { RouteItem } from '../types/route';

// 模拟从后端获取的路由数据
const mockRouteData: RouteItem[] = [
  {
    id: "1",
    parentId: "1",
    menuName: "页面1",
    menuCode: "page1-1",
    icon: "",
    type: 2,
    routePath: "page1-1",
    urlAddress: "/page1",
    isEnable: 1,
    sortValue: 1,
    children: null,
    checked: 0,
    lastChildren: false
  },
  {
    id: "2",
    parentId: "2",
    menuName: "页面2",
    menuCode: "page2-2",
    icon: "",
    type: 2,
    routePath: "page2-2",
    urlAddress: "/page2",
    isEnable: 1,
    sortValue: 1,
    children: null,
    checked: 0,
    lastChildren: false
  },
  {
    id: "3",
    parentId: "3",
    menuName: "页面3",
    menuCode: "page3-3",
    icon: "",
    type: 2,
    routePath: "page3-3",
    urlAddress: "/page3",
    isEnable: 1,
    sortValue: 1,
    children: null,
    checked: 0,
    lastChildren: false
  }
];

// 获取路由数据
export const getRoutes = (): Promise<RouteItem[]> => {
  // 实际项目中，这里应该是从API获取数据
  return Promise.resolve(mockRouteData);
};

// 处理路由路径，确保格式正确
export const processRoutePath = (route: RouteItem): string => {
  // 确保路径以/开头
  return route.routePath.startsWith('/') ? route.routePath : `/${route.routePath}`;
};

// 处理组件路径，确保格式正确
export const processComponentPath = (route: RouteItem): string => {
  // 确保路径以/开头
  return route.urlAddress.startsWith('/') ? route.urlAddress : `/${route.urlAddress}`;
};