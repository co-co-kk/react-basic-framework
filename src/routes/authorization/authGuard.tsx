import { useEffect, useRef, useState } from 'react';

import { message } from 'antd';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();
  const hasHandledLicenseInvalid = useRef(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  // 检查是否有有效的token
  const checkTokenValidity = () => {
    const accessToken = localStorage.getItem('access_token_lf');
    const refreshToken = localStorage.getItem('refresh_token_lf');
    
    // 简单检查是否存在token
    if (accessToken && refreshToken) {
      // 可以添加更复杂的token验证逻辑
      return true;
    }
    return false;
  };

  // 处理证书状态异常
  const handleLicenseInvalid = () => {
    if (hasHandledLicenseInvalid.current) return; // 如果已经处理过，直接返回
    hasHandledLicenseInvalid.current = true; // 标记为已处理
  };

  useEffect(() => {
    const valid = checkTokenValidity();
    setIsValid(valid);
    setIsChecking(false);
    
    // 如果token无效，清除所有认证数据
    if (!valid) {
      clearAllAuthData();
    }
  }, []);

  const buttonPermission = JSON.parse(localStorage.getItem('buttonPermission') || '[]');

  // 如果还在检查，则不渲染内容
  if (isChecking) {
    return null;
  }

  // 如果没有有效的token，跳转到登录页
  if (!isValid) {
    const currentPath = location.pathname;
    const isHomePath = currentPath === '/' || currentPath === '/flows';
    const isLoginPage = location.pathname.includes('login');
    return <CustomNavigate to={'/login' + (!isHomePath && !isLoginPage ? '?redirect=' + currentPath : '')} replace />;
  }
  
  // 如果已经处理过证书异常
  if (hasHandledLicenseInvalid.current) {
    if (buttonPermission.length === 0) {
      return <CustomNavigate to="/forbidden" />;
    }
  }

  return children;
};