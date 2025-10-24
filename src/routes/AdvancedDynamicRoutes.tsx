import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import { getRoutes } from './routeManager';
import { RouteItem } from '../types/route';

// 加载组件的函数
const loadComponent = (path: string) => {
  // 去掉开头的斜杠
  const componentPath = path.startsWith('/') ? path.substring(1) : path;
  // 动态导入组件
  return lazy(() => {
    /* @vite-ignore */
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

const AdvancedDynamicRoutes: React.FC = () => {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const routeData = await getRoutes();
        setRoutes(routeData);
      } catch (error) {
        console.error('加载路由失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">加载路由中...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
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
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AdvancedDynamicRoutes;