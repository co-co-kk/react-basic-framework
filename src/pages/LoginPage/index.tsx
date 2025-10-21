import React, { createRef, useState, useEffect, useRef } from 'react';

import { message, Modal } from 'antd';
import autofit from 'autofit.js';
import axios from 'axios';
import md5 from 'js-md5';

import {
  saveCredentials,
  clearSavedCredentials,
  clearAuthDataPreserveCredentials,
  loadSavedCredentials as loadSavedCredentialsUtil,
} from '@/utils/authUtils';
import { clearAllCookies } from '@/utils/utils';

import {
  getLoginList,
  authV1Login,
  getSendSmsCode,
  smsLoginPhoneLogin,
  getCurrentUserInfo,
} from '@/api/loginConfiguration';
import { getPermissions } from '@/api/menu/index'; // 小星调用权限接口

import LoginPage1 from './components/loginPage1';
import LoginPage2 from './components/loginPage2';
import LoginPage3 from './components/loginPage3';
import LoginPage4 from './components/loginPage4';
import LoginPage5 from './components/loginPage5';

import loginBg1 from '@/assets/login/bg1.jpg';
import loginBg2 from '@/assets/login/bg2.jpg';
import loginBg3 from '@/assets/login/bg3.jpg';
import loginBg4 from '@/assets/login/bg4.jpg';
import loginLogo from '@/assets/login/loginLogo.png';
import { useCustomNavigate } from "@/hooks/use-custom-navigate";
import useAuthStore from '@/store/authStore';

import { getBackendManagement_URL, comDownloadUrl } from "@/utils/urlConfig/config-constants";
import { useMenuStore } from '@/store/menuStore';
import { usePermissionStore } from '@/store/permissionStore';

const setCookie = (cookieName, cookieValue, longTime) => {
  document.cookie = `${cookieName}=${cookieValue};path=/;expires=${new Date(Date.now() + longTime).toUTCString()}`;
};

const Login = () => {
  const navigate = useCustomNavigate();
  const setAutoLogin = useAuthStore((state) => state.setAutoLogin);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  const [showPage, setShowPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState('用户登录');
  const [isCounting, setIsCounting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [showLogo, setShowLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState(loginLogo);
  const [showBg, setShowBg] = useState(true);
  const [bgUrl, setBgUrl] = useState(loginBg1);
  const [showTransparency, setShowTransparency] = useState(1);
  const [loginTitle, setLoginTitle] = useState('登录');
  const [welcomeTitle, setWelcomeTitle] = useState('欢迎使用数智小星AI系统');
  const [platformType, setPlatformType] = useState('前台');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [versionNumber, setVersionNumber] = useState('1.2.1');
  const [formData, setFormData] = useState({
    name: '',
    pwd: '',
    phone: '',
    code: '',
  });

  const [codeDisabled, setCodeDisabled] = useState(false);

  const { queryAdmin, fetchMenuData } = useMenuStore();

  const loadSavedCredentials = () => {
    const savedData = loadSavedCredentialsUtil();
    if (savedData.rememberMe) {
      // 默认选中记住密码
      setRememberMe(true);

      // if (savedData.isPhone) {
      //   console.log('设置手机号:', savedData.username);
      //   // 是手机号，设置到phone字段
      //   setFormData(prev => ({
      //     ...prev,
      //     phone: savedData.username
      //   }));
      //   setType('手机登录');
      // } else {
      // 是用户名，设置到name字段
      setFormData((prev) => ({
        ...prev,
        name: savedData.username || '',
        pwd: savedData.password,
      }));
      setType('用户登录');
      // }
    }

    // else {
    //   console.log('没有找到保存的凭据');
    //   // 如果没有保存的凭据，默认不选中记住密码
    //   setRememberMe(false);
    // }
  };

  // 添加防抖函数
  const useDebounce = (fn: Function, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  // 切换忘记密码
  const switchForgotPassword = (ifShow) => {
    setShowForgotPassword(ifShow);
  };

  // 账号密码登录
  const handleLogin = async () => {
    if (!formData.name) {
      message.error('帐号不能为空！');
      return;
    }

    if (!formData.pwd) {
      message.error('密码不能为空！');
      return;
    }

    setLoading(true);

    const data = {
      username: formData.name,
      password: md5(formData.pwd),
      // password: formData.pwd
    };
    // const data = {
    //   name: formData.name,
    //   pwd: md5(formData.pwd)
    // };
    await handleAccountLogin(data);
  };

  // 登陆验证
  const handleAccountLogin = async (data) => {
    try {
      const res = await authV1Login(data);

      // const response = await getLoginVerification(data);
      if (res.code === 200) {
        if (rememberMe) {
          saveCredentials(formData.name, formData.pwd);
        } else {
          clearSavedCredentials();
        }
        localStorage.setItem('access_token_lf', res.data.accessToken);
        localStorage.setItem('refresh_token_lf', res.data.refreshToken);
        await redirectLogin();
      } else {
        message.error(res.message);
      }
    } catch (e: any) {
      console.log(e);
      // message.error(e.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const isLoginError = useRef(false);

  // 登陆跳转
  const redirectLogin = async () => {
    try {
      // 4. 验证用户授权状态
      const userInfoRes = await getCurrentUserInfo();
      const userInfo = userInfoRes?.data || {};
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      await getUserPermissions();
      setCookie('user_info', encodeURIComponent(JSON.stringify(userInfo)), {
        path: '/',
        maxAge: 365 * 24 * 60 * 60, // 秒
      });
      await fetchMenuData();
      await queryAdmin();

      if (userInfoRes.data.code !== 200) {
        message.error(userInfoRes.data.message);
        return;
      }
      const { licenseStatus, userType } = userInfo;

      // if (!isFrontendMenu) {
      //   navigate("/forbidden")
      // } else {

      if (licenseStatus !== 1) {
        isLoginError.current = true;
        handleLicenseError(licenseStatus, userType == 1);
        return;
      } else {
        isLoginError.current = false;
      }

      // 7. 登录成功处理
      setAutoLogin(true);
      setIsAuthenticated(true);

      platformType === '前台'
        ? navigate('/navigation/xiaoxing')
        : (window.location.href = getBackendManagement_URL());
    } catch (error) {
      clearAllAuthData();
      isLoginError.current && message.error('登录流程异常，请稍后重试');
      console.error('登录错误:', error);
    }
  };

  const getUserPermissions = async () => {
    // 获取权限数据并更新Store
    await getPermissions('tianshu_ai_frontend')
      .then((res) => {
        if (res?.data?.code === 200) {
          const permissions = res.data.data;
          const storedPermissions = usePermissionStore.getState().buttonPermission;
          if (JSON.stringify(permissions) !== JSON.stringify(storedPermissions)) {
            localStorage.setItem('buttonPermission', JSON.stringify(permissions));
            usePermissionStore.getState().updatePermissions(permissions);
          }
          usePermissionStore.getState().setIsPermissionLoaded(true);
        }
      })
      .catch((error) => {
        usePermissionStore.getState().setIsPermissionLoaded(true); // 即使失败也设置为 true，避免无限等待
        console.error('获取权限失败:', error);
      });
  };

  // 授权错误处理函数
  const handleLicenseError = (status: number, isAdmin: boolean) => {
    if (status) {
      if (isAdmin) {
        window.location.href = getBackendManagement_URL()
        return;
      }

      const errorMap = {
        2: '产品授权已失效，请联系管理员更新授权',
        3: '产品授权已到期，请联系管理员更新授权',
        4: '产品授权未导入，请联系管理员更新授权',
      };
      clearAllAuthData();

      message.error(errorMap[status]);
    } else {
      clearAllAuthData();
      message.error('数据异常，请联系管理员处理');
    }
  };

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

  // 切换登录方式
  const switchLoginType = (title) => {
    setType(title);
  };

  // 切换登录前台后台方式
  const switchPlatformType = (type) => {
    setPlatformType(type);
  };

  // 点击登陆按钮
  const handleSubmit = async () => {
    /**
     * 清除所有cookie和localStorage，但保留记住密码信息
     */
    clearAllCookies();
    clearAuthDataPreserveCredentials();

    if (type === '用户登录') {
      if (formData.name && formData.pwd) {
        await handleLogin();
      }
    } else {
      if (formData.phone && formData.code) {
        await handlePhoneLogin();
      }
    }
  };

  // 发送验证码
  const sendVerificationCode = useDebounce(async () => {
    if (isCounting) return;

    const phoneRegex = /^1[3456789]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      message.warning('手机号输入格式有误');
      return;
    }

    try {
      setCodeDisabled(true);
      const params = {
        mobile: formData.phone,
        scene: 1,
      };
      const response = await getSendSmsCode(params);
      // const response = await getPhoneCode(params);
      const res = response.data;
      if (res.code === 200) {
        startCountdown();
        message.success(res.message || res.msg);
      } else {
        // 使用destroy方法确保只显示一个错误消息
        message.destroy();
        setCodeDisabled(false);
        message.error(res.msg);
      }
    } catch (error) {
      // message.destroy();
      setCodeDisabled(false);
      // message.error('发送验证码失败');
    }
  }, 500);

  // 验证码倒计时
  const startCountdown = () => {
    setIsCounting(true);
    setCountdown(60);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCounting(false);
          setCodeDisabled(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 手机登陆
  const handlePhoneLogin = async () => {
    const phoneRegex = /^1[3456789]\d{9}$/;
    if (!formData.phone) {
      message.error('手机号不能为空！');
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      message.warning('手机号输入格式有误');
      return;
    }

    if (!formData.code) {
      message.error('验证码不能为空！');
      return;
    }

    try {
      const response = await smsLoginPhoneLogin(formData.phone, formData.code);
      // const response = await postPhoneLogin(formData.phone, formData.code);
      const res = response.data;

      if (res.code === 200) {
        // 处理记住密码（手机登录时，如果勾选了记住密码，保存手机号）
        if (rememberMe) {
          saveCredentials(formData.phone, '');
        } else {
          clearSavedCredentials();
        }
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('refresh_token_lf', res.data.refreshToken);

        redirectLogin();
      } else {
        message.error(res.message);
      }
    } catch (error: any) {
      message.error(error.response.data.message);
      setCodeDisabled(false);
    }
  };

  const queryLogin = async () => {
    try {
      setIsLoading(false);
      const response = await getLoginList();
      const res = response.data;
      if (res.code === 200) {
        setShowPage(res.data.template);
        setShowLogo(res.data.layoutStyle === 'text' ? false : true);
        const logoData = JSON.parse(res.data.logoImageUrl);
        setLogoUrl(logoData.select === 'default' ? loginLogo : comDownloadUrl + logoData.select);
        const bgData = JSON.parse(res.data.bgUrl);
        if (bgData.select === 'default' || bgData.select === 'bg1') {
          setBgUrl(loginBg1);
        } else if (bgData.select === 'bg2') {
          setBgUrl(loginBg2);
        } else if (bgData.select === 'bg3') {
          setBgUrl(loginBg3);
        } else if (bgData.select === 'bg4') {
          setBgUrl(loginBg4);
        } else {
          setBgUrl(comDownloadUrl + bgData.select);
        }
        setShowTransparency(res.data.bgOpacity / 100);
        setLoginTitle(res.data.title);
        setWelcomeTitle(res.data.welcomeMessage);
      } else {
        console.log('查询登录数据失败');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(true);
    }
  };

  const isPhoneValid = (phone: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone.trim());
  };

  useEffect(() => {
    // 定义一个异步函数来执行初始化逻辑
    const initializeLogin = async () => {
      try {
        // 调用查询登录配置
        await queryLogin();

        // 初始化自动适应
        autofit.init({
          dh: 1080,
          dw: 1920,
          el: '.your-page-class',
          resize: true,
        });
      } catch (error) {
        console.error('初始化失败:', error);
        // 可以在这里添加错误处理逻辑，比如显示错误提示
        message.error('初始化登录页面失败');
      }
    };

    // 先清除认证数据，但保留记住密码信息
    clearAllAuthData();

    // 然后执行初始化
    initializeLogin();

    // 在初始化完成后加载保存的凭据
    setTimeout(() => {
      loadSavedCredentials();
    }, 100);

    // 清理函数
    return () => {
      autofit.off();
    };
  }, []);

  const loginProps = {
    loading,
    type,
    isCounting,
    rememberMe,
    countdown,
    formData,
    setFormData,
    setRememberMe,
    switchLoginType,
    handleSubmit,
    sendVerificationCode,
    showLogo,
    logoUrl,
    loginTitle,
    welcomeTitle,
    showBg,
    bgUrl,
    showTransparency,
    platformType,
    switchPlatformType,
    showForgotPassword,
    switchForgotPassword,
    versionNumber: `版本号：V${versionNumber}`,
    isPhoneValid,
    codeDisabled,
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      className="your-page-class"
    >
      {isLoading && (
        <>
          {
            {
              1: <LoginPage1 {...loginProps} />,
              2: <LoginPage2 {...loginProps} />,
              3: <LoginPage3 {...loginProps} />,
              4: <LoginPage4 {...loginProps} />,
              5: <LoginPage5 {...loginProps} />,
            }[showPage]
          }
        </>
      )}
    </div>
  );
};

export default Login;
