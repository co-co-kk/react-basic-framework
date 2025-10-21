import React, { useState, useEffect } from 'react';

import { Form, Input, Button, Checkbox, Divider, message } from 'antd';
import axios from 'axios';
import md5 from 'js-md5';

import { decryptText } from '@/utils/cryptoUtils';

import AccountIcon from '@/assets/login/account.png';
import CodeIcon from '@/assets/login/code.png';
import logoDingding from '@/assets/login/dingding.png';
import PasswordIcon from '@/assets/login/password.png';
import PhoneIcon from '@/assets/login/phone.png';
import logoWeixin from '@/assets/login/weixin.png';
import wxQrcode from '@/assets/login/wxcode.png';
import { useCustomNavigate } from '@/hooks/use-custom-navigate';
import useAuthStore from '@/store/authStore';

import './index.css';
// import { getPlatformTenantId } from '@/controllers/API/queries/messages/use-get-messages.ts'
// import { H } from '@icon-park/react';
const LoginForm = () => {
  const [form] = Form.useForm();
  const navigate = useCustomNavigate();
  const setAutoLogin = useAuthStore((state) => state.setAutoLogin);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
  // // 状态管理
  const [loginType, setLoginType] = useState('输入登录');
  const [type, setType] = useState('用户登录');
  const [loginBtnText, setLoginBtnText] = useState('登录');
  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    pwd: '',
    phone: '',
    code: '',
  });

  // 自定义标签样式
  const formStyle = {
    labelStyle: {
      fontWeight: 400,
      fontSize: '14px',
      color: '#092C4D',
      display: 'flex',
      alignItems: 'center',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    },
    imgStyle: {
      width: '12px',
      height: '14px',
      marginRight: '8px',
    },
    inputStyle: {
      width: '100%',
      height: '32px',
      backgroundColor: '#fff',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
      // 以下样式确保在不同状态下背景色不变
      '&:hover': {
        backgroundColor: '#e8f0fe !important',
      },
      '&:focus': {
        backgroundColor: '#e8f0fe !important',
      },
    },
  };

  useEffect(() => {
    // 使用新的记住密码系统
    const rememberMe = localStorage.getItem('rememberMe');
    const savedUsername = localStorage.getItem('savedUsername');
    const savedPassword = localStorage.getItem('savedPassword');

    if (rememberMe === 'true' && savedUsername) {
      // 判断是用户名还是手机号
      if (savedUsername.length === 11 && /^\d+$/.test(savedUsername)) {
        // 是手机号
        setFormData((prev) => ({ ...prev, phone: savedUsername }));
        setType('手机登录');
      } else {
        // 是用户名
        if (savedPassword) {
          // 尝试解密密码
          try {
            const decryptedPassword = decryptText(savedPassword);
            setFormData((prev) => ({ ...prev, name: savedUsername, pwd: decryptedPassword }));
          } catch (error) {
            console.error('密码解密失败:', error);
            setFormData((prev) => ({ ...prev, name: savedUsername }));
          }
        } else {
          setFormData((prev) => ({ ...prev, name: savedUsername }));
        }
        setType('用户登录');
      }
      setRememberMe(true);
    }

    // 监听回车键
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 切换登录方式
  const switchLoginType = (title) => {
    setType(title);
    setLoginBtnText(title === '手机登录' ? '登录 / 注册' : '登录');
  };

  // 发送验证码
  const sendVerificationCode = async () => {
    if (isCounting) return;

    const phoneRegex = /^1[3456789]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      message.warning('手机号输入格式有误');
      return;
    }

    try {
      // const res = await getPhoneCode({ phone: formData.phone });
      const response = await axios.get(`/api/platform/usercenter/SysUserAcc/loginByPhone_sendVc`, {
        params: {
          phone: formData.phone, // 直接作为ticket参数传递
        },
      });
      const res = response.data;
      if (res.code === 200) {
        startCountdown();
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      // message.error('发送验证码失败');
    }
  };

  // 倒计时
  const startCountdown = () => {
    setIsCounting(true);
    setCountdown(60);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCounting(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 提交表单
  const handleSubmit = async () => {
    // if (!agreed) {
    //   message.error('请勾选阅读内容！');
    //   return;
    // }

    if (type === '用户登录') {
      if (formData.name && formData.pwd) {
        await handleAccountLogin();
      }
    } else {
      if (formData.phone && formData.code) {
        await handlePhoneLogin();
      }
    }
  };

  const setCookie = (cookieName, cookieValue, longTime) => {
    document.cookie = `${cookieName}=${cookieValue};path=/;expires=${new Date(Date.now() + longTime).toUTCString()}`;
  };

  const redirectLogin = async (ticket) => {
    const response = await axios.get(`/api/platform/oauth/sso/doLoginByTicketUpdate`, {
      params: {
        ticket: ticket, // 直接作为ticket参数传递
      },
    });
    const res = response.data;
    if (res.code === 200) {
      console.log(res.data.token);

      setCookie('tstoken', res.data.token, 365 * 24 * 60 * 60 * 1000);
      localStorage.setItem('tstoken', res.data.token);
      // const newData = await getPlatformTenantId({ platform: "vue3" })
      // const tenantId = newData?.data?.data
      // setCookie('tenantId', tenantId, 365 * 24 * 60 * 60 * 1000);
      localStorage.setItem('access_token_lf', res.data.token);
      localStorage.setItem('refresh_token_lf', res.data.token);
      setAutoLogin(true);
      setIsAuthenticated(true);
      navigate('/navigation/xiaoxing');
    } else {
      message.error(res.msg);
    }
  };

  // 账号密码登录
  const handleAccountLogin = async () => {
    if (!formData.name) {
      message.error('帐号不能为空！');
      return;
    }

    if (!formData.pwd) {
      message.error('密码不能为空！');
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: formData.name,
        pwd: md5(formData.pwd),
      };

      if (rememberMe) {
        localStorage.setItem(
          'loginInfo',
          JSON.stringify({
            account: formData.name,
            pwd: formData.pwd,
          }),
        );
      } else {
        localStorage.removeItem('loginInfo');
      }

      const response = await axios.get(`/api/platform/usercenter/sso/doLogin`, { params: data });
      const res = response.data;

      if (res.code === 200) {
        redirectLogin(res.data.ticketValue);
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 手机验证码登录
  const handlePhoneLogin = async () => {
    const phoneRegex = /^1[3456789]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      message.warning('手机号输入格式有误');
      return;
    }

    if (!formData.code) {
      message.error('验证码不能为空！');
      return;
    }

    try {
      const response = await axios.post(
        `api/platform/usercenter/BaseDblink/loginByPhone_ok?phone=${formData.phone}&vc=${formData.code}&platform=6`,
      );
      const res = response.data;

      if (res.code === 200) {
        redirectLogin(res.data.ticketValue);
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      message.error('登录失败');
    }
  };

  return (
    <div className="w-full flex justify-center items-center">
      {loginType === '输入登录' ? (
        <div className="w-[320px] mb-[120px]">
          <div className="flex items-center">
            <span
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              }}
              className={`text-[#092C4D] mr-[20px] cursor-pointer ${
                type === '用户登录' ? 'text-[23px] font-black' : 'text-[20px] font-normal'
              }`}
              onClick={() => switchLoginType('用户登录')}
            >
              用户登录
            </span>
            <span
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              }}
              className={`text-[#092C4D] cursor-pointer ${
                type === '手机登录' ? 'text-[23px] font-black' : 'text-[20px] font-normal'
              }`}
              onClick={() => switchLoginType('手机登录')}
            >
              手机登录
            </span>
          </div>

          <div className="text-[#90A0AF] text-[17px] mt-[12px] mb-[20px] font-medium">欢迎登录天枢数智小星平台</div>

          <Form form={form} onFinish={handleSubmit} layout="vertical">
            {type === '用户登录' ? (
              <>
                <Form.Item
                  label={
                    <span style={formStyle.labelStyle}>
                      <img src={AccountIcon} alt="账号" style={formStyle.imgStyle} />
                      账号
                    </span>
                  }
                  style={{ marginBottom: '10px' }}
                  required={false}
                  name="name"
                  rules={[{ required: true, message: '请输入账号' }]}
                >
                  <Input
                    className="force-bg-color"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入账号"
                    style={formStyle.inputStyle}
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <span style={formStyle.labelStyle}>
                      <img src={PasswordIcon} alt="密码" style={formStyle.imgStyle} />
                      密码
                    </span>
                  }
                  style={{ marginBottom: '10px' }}
                  required={false}
                  name="pwd"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password
                    className="force-bg-color"
                    value={formData.pwd}
                    onChange={(e) => setFormData({ ...formData, pwd: e.target.value })}
                    placeholder="请输入密码"
                    style={formStyle.inputStyle}
                  />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item
                  label={
                    <span style={formStyle.labelStyle}>
                      <img src={PhoneIcon} alt="手机号" style={formStyle.imgStyle} />
                      手机号
                    </span>
                  }
                  style={{ marginBottom: '10px' }}
                  required={false}
                  name="phone"
                  rules={[{ required: true, message: '请输入账请输入手机号号' }]}
                >
                  <Input
                    className="force-bg-color"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="请输入手机号"
                    style={formStyle.inputStyle}
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <span style={formStyle.labelStyle}>
                      <img src={CodeIcon} alt="验证码" style={formStyle.imgStyle} />
                      验证码
                    </span>
                  }
                  style={{ marginBottom: '10px' }}
                  required={false}
                  name="code"
                  rules={[{ required: true, message: '请输入验证码' }]}
                >
                  <div className="flex items-center justify-between w-full">
                    <Input
                      className="force-bg-color"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="请输入验证码"
                      style={formStyle.inputStyle}
                    />
                    <Button
                      type="primary"
                      className="ml-[20px]"
                      onClick={sendVerificationCode}
                      disabled={isCounting}
                      style={{
                        background: '#419eff',
                        borderRadius: '4px',
                        color: '#FFFFFF',
                        fontFamily: 'Microsoft YaHei',
                        fontWeight: '500',
                        fontSize: '14px',
                      }}
                    >
                      {isCounting ? `${countdown}秒后重发` : '发送验证码'}
                    </Button>
                  </div>
                </Form.Item>
              </>
            )}

            <Form.Item style={{ marginBottom: '10px' }}>
              <div className="flex items-center justify-between w-full">
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ '--checked-color': '#419eff' }}
                  className="custom-checkbox"
                >
                  <span className="text-[#90A0AF] text-[14px] font-medium">记住密码</span>
                </Checkbox>
                <span className="text-[#90A0AF] text-[14px] cursor-pointer font-medium">忘记密码？</span>
              </div>
            </Form.Item>

            <Form.Item style={{ marginBottom: '0px' }}>
              <Button
                type="primary"
                htmlType="submit"
                id={'loginBtn'}
                className="w-full h-[40px]"
                style={{
                  backgroundColor: '#409EFF',
                  borderColor: '#409EFF',
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
                  '&:hover': {
                    backgroundColor: '#66b1ff',
                    borderColor: '#66b1ff',
                  },
                  '&:active': {
                    backgroundColor: '#3a8ee6',
                    borderColor: '#3a8ee6',
                  },
                  '&:focus': {
                    outline: 'none',
                  },
                }}
                loading={loading}
              >
                {loginBtnText}
              </Button>
            </Form.Item>

            {/* <Form.Item>
              <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)}>
                <div className="flex">
                  <span className="text-[#90A0AF] text-[11px] font-medium">我已阅读并同意</span>
                  <span className="text-[#409EFF] text-[11px] cursor-pointer font-medium">《用户隐私政策协议》</span>
                </div>
              </Checkbox>
            </Form.Item> */}
          </Form>

          {/* <div className="mt-[60px]">
            <Divider>
              <span className="text-[#90A0AF] text-[12px] font-medium">第三方登录方式</span>
            </Divider>
          </div>

          <div className="flex justify-center">
            <img src={logoDingding} className="w-[40px] h-[40px] mr-[20px] cursor-pointer" alt="钉钉登录" />
            <img src={logoWeixin} className="w-[40px] h-[40px] cursor-pointer" alt="微信登录" />
          </div> */}
        </div>
      ) : (
        <div className="w-[320px]">
          <div className="flex flex-col justify-center items-center">
            <span className="text-[#092C4D] text-[23px] font-bold">微信扫码登录</span>
            <span className="text-[#90A0AF] text-[17px] mt-[20px] mb-[40px]">欢迎登录天枢云采中心</span>
            <div className="w-[240px] h-[240px]">
              <img src={wxQrcode} alt="微信扫码" className="h-[240px] bg-red-500" />
            </div>
          </div>

          <div className="mt-[60px]">
            <Divider>
              <span className="text-[#90A0AF] text-[13px] font-medium">第三方登录方式</span>
            </Divider>
          </div>

          <div className="flex justify-center">
            <img src={logoDingding} className="w-[40px] h-[40px] mr-[20px]" alt="钉钉登录" />
            <img src={logoWeixin} className="w-[40px] h-[40px]" alt="微信登录" />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
