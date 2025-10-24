import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { RouteItem } from '../types/route';

// 加载组件的函数
const loadComponent = (path: string) => {
  // 去掉开头的斜杠
  const componentPath = path.startsWith('/') ? path.substring(1) : path;
  // 动态导入组件，添加vite-ignore注释以避免警告
  return lazy(() => {
    // @vite-ignore
    return import(`../pages/${componentPath}`);
  });
};

// 加载中组件
const LoadingComponent = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2">加载中...</p>
    </div>
  </div>
);

interface DynamicRoutesProps {
  routes: RouteItem[];
}

const DynamicRoutes: React.FC<DynamicRoutesProps> = ({ routes }) => {
  return (
    <>
      {routes.map((route) => {
        // 只处理启用的路由
        if (route.isEnable !== 1) return null;
        
        // 获取组件
        const Component = loadComponent(route.urlAddress);
        
        return (
          <Route
            key={route.id}
            path={route.routePath}
            element={
              <Suspense fallback={<LoadingComponent />}>
                <Component />
              </Suspense>
            }
          />
        );
      })}
    </>
  );
};

export default DynamicRoutes;