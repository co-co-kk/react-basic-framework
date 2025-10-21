import { useEffect, useRef } from 'react';

import { message } from 'antd';

import { clearAuthDataPreserveCredentials } from '@/utils/authUtils';

import { CustomNavigate } from '@/routes/customization/custom-navigate';

// 清除所有认证数据的工具函数
const clearAllAuthData = () => {
  // 1. 清除所有Cookie
  document.cookie.split(';').forEach((cookie) => {
    // 将每个Cookie的过期时间设置为过去时间，使其立即失效
    document.cookie = cookie
      .replace(/^ +/, '')
      .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/;domain=${window.location.hostname}`);
  });

  // 2. 清除localStorage中的认证数据，但保留记住密码信息
  clearAuthDataPreserveCredentials();

  // 3. 清除sessionStorage
  sessionStorage.clear();
};

export const ProtectedRoute = ({ children }) => {
  // 用户信息相关

  const hasHandledLicenseInvalid = useRef(false);

  // 处理证书状态异常
  const handleLicenseInvalid = () => {
    if (hasHandledLicenseInvalid.current) return; // 如果已经处理过，直接返回
    hasHandledLicenseInvalid.current = true; // 标记为已处理
  };

  const buttonPermission = JSON.parse(localStorage.getItem('buttonPermission') || '[]');

  if (!hasHandledLicenseInvalid) {
    const currentPath = window.location.pathname;
    const isHomePath = currentPath === '/' || currentPath === '/flows';
    const isLoginPage = location.pathname.includes('login');
    return <CustomNavigate to={'/login' + (!isHomePath && !isLoginPage ? '?redirect=' + currentPath : '')} replace />;
  } else if (buttonPermission.length === 0) {
    return <CustomNavigate to="/forbidden" />;
  } else {
    return children;
  }
};
