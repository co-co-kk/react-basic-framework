import React, { CSSProperties, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Divider } from 'antd';
import ForgotPassword from './ForgotPassword';
import {
  setLocalRememberMe,
  loadSavedCredentials as loadSavedCredentialsUtil
} from '@/utils/authUtils';
interface LoginPageProps {
  loading: boolean;
  type: string;
  isCounting: boolean;
  rememberMe: boolean;
  countdown: number;
  formData: {
    name: string;
    pwd: string;
    phone: string;
    code: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    pwd: string;
    phone: string;
    code: string;
  }>>;
  setRememberMe: React.Dispatch<React.SetStateAction<boolean>>;
  switchLoginType: (title: string) => void;
  handleSubmit: () => void;
  sendVerificationCode: () => void;
  showLogo: boolean;
  logoUrl: string;
  loginTitle: string;
  welcomeTitle: string;
  showBg: boolean;
  bgUrl: string;
  showTransparency: number;
  platformType: string;
  switchPlatformType: (type: string) => void;
  showForgotPassword: boolean;
  switchForgotPassword: (type: boolean) => void;
  versionNumber: string;
  isPhoneValid: (phone: string) => boolean;
  codeDisabled: boolean;
}

const LoginPage5: React.FC<LoginPageProps> = ({
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
  versionNumber,
  isPhoneValid,
  codeDisabled
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    const savedData = loadSavedCredentialsUtil();
    if (savedData.rememberMe) {
      form.setFieldsValue({
        name: savedData.username,
        pwd: savedData.password
      });
    }
  }, []);
  const formStyle = {
    labelStyle: {
      fontWeight: 500,
      fontSize: '18px',
      color: '#092C4D',
      display: 'flex',
      alignItems: 'center',
      fontFamily: 'PingFangSC-medium'
    },
    inputStyle: {
      width: '100%',
      height: '46px',
      backgroundColor: '#fff !important',
      border: '1px solid rgba(195,203,214,1) !important', // 固定边框
      outline: 'none !important', // 移除点击时的外边框
      boxShadow: 'none !important', // 移除点击时的阴影效果
      color: '#092C4D',
      fontFamily: 'PingFangSC-medium',
      fontSize: '16px !important',
      '& input': {
        fontSize: '16px !important',
      },
      '&::placeholder': {
        fontSize: '16px !important',
      },
      transition: 'background-color 5000s ease-in-out 0s, color 5000s ease-in-out 0s',
      '&:hover': {
        backgroundColor: '#e8f0fe !important',
        border: '1px solid rgba(195,203,214,1) !important', // 悬停时保持相同边框
      },
      '&:focus': {
        backgroundColor: '#e8f0fe !important',
        border: '1px solid rgba(195,203,214,1) !important', // 聚焦时保持相同边框
      },
    }
  };

  const globalStyles = `
    .ant-input, .ant-input-affix-wrapper {
      box-shadow: none !important;
    }
    .ant-input:focus, .ant-input-focused, .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused {
      box-shadow: none !important;
    }
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus, 
    input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px white inset !important;
      -webkit-text-fill-color: #092C4D !important;
      font-size: 16px !important;
      font-family: PingFangSC-medium !important;
    }
    input, input::placeholder, input:-webkit-autofill::first-line {
      font-size: 16px !important;
      font-family: PingFangSC-medium !important;
    }

    .verification-code-btn {
      border-radius: 6px;
      font-size: 16px;
      height: 46px;
      margin-left: 20px;
      background-color: #fff;
      border-color: #002FA7;
      color: #002FA7;
    }

    .verification-code-btn:disabled {
      background-color: #f5f5f5 !important;
      border-color: #d9d9d9 !important;
      color: rgba(0, 0, 0, 0.25) !important;
      cursor: not-allowed;
    }

    .verification-code-btn:not(:disabled) {
      cursor: pointer;
    }

    .verification-code-btn:not(:disabled):hover,
    .verification-code-btn:not(:disabled):active,
    .verification-code-btn:not(:disabled):focus {
      background-color: #002FA7 !important;
      color: white !important;
      border-color: #002FA7 !important;
    }
    .login-type-switch-btn {
      background-color: #fff;
      border-color: #002FA7;
      color: #002FA7;
      border-radius: 10px;
      font-size: 18px;
      height: 46px;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    }

    .login-type-switch-btn:hover,
    .login-type-switch-btn:active,
    .login-type-switch-btn:focus {
      background-color: #002FA7 !important;
      color: white !important;
      border-color: #002FA7 !important;
      outline: none;
    }
    
    .login-btn {
      background-color: #002FA7 !important;
      border-color: #002FA7 !important;
      color: #FFFFFF !important;
      border-radius: 10px;
      font-size: 18px;
      height: 46px;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    
    .login-btn:hover {
      background-color: rgba(0,47,167,0.8) !important;
      border-color: #002FA7 !important;
      color: rgba(255,255,255,1) !important;
    }
    
    .login-btn:active {
      background-color: rgba(0,34,107,1) !important;
      border-color: #002FA7 !important;
      color: rgba(255,255,255,1) !important;
    }
  `;

  return (
    <div
      style={{
        backgroundImage: showBg ? `url(${bgUrl})` : 'none',
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        width: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}>

      <style>{globalStyles}</style>

      <div className="w-[26%] h-[60%] flex justify-center">
        <div className="w-[100%] h-full bg-[rgba(1,1,1,0.5)] rounded-[10px] flex justify-center shadow-[0_2px_6px_0_rgba(0,47,167,0.23)]"
          style={{ backgroundColor: `rgba(0, 0, 0, ${showTransparency})` }}>
          {showForgotPassword ? (
            <ForgotPassword switchForgotPassword={switchForgotPassword} />
          ) : (
            <div className="w-full flex justify-center items-center">
              <div className="w-[64%] h-full relative">
                <div className="h-[5%]"></div>
                {showLogo ? (
                  <div className="h-[14%] w-full flex justify-center items-center">
                    <img
                      src={logoUrl}
                      alt="login"
                      className="max-w-[99%] h-[60%]"
                    />
                  </div>
                ) : (
                  <div className="h-[14%]">
                    <div className="h-[55%]">
                      <span
                        style={{
                          fontFamily: 'PingFangSC-medium'
                        }}
                        className='text-[#fff] mr-[20px] cursor-pointer text-[26px] font-medium'
                      >
                        {loginTitle}
                      </span>
                    </div>

                    <div className="h-[45%] text-[#90A0AF] text-[18px]">
                      {welcomeTitle}
                    </div>
                  </div>
                )}

                <div className="h-[12%] flex items-center pb-[5%] relative">
                  <span
                    style={{
                      fontFamily: 'PingFangSC-medium',
                      color: type === '用户登录' ? '#fff' : '#DFE2E7',
                      position: 'relative',
                    }}
                    className={`mr-[20px] cursor-pointer ${type === '用户登录' ? 'text-[20px] font-black' : 'text-[18px] font-normal'}`}
                    onClick={() => switchLoginType('用户登录')}
                  >
                    账号登录
                    {type === '用户登录' && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: 0,
                        width: '100%',
                        height: '3px',
                        backgroundColor: '#fff'
                      }} />
                    )}
                  </span>
                  <span
                    style={{
                      fontFamily: 'PingFangSC-medium',
                      color: type === '手机登录' ? '#fff' : '#DFE2E7',
                      position: 'relative',
                    }}
                    className={`cursor-pointer ${type === '手机登录' ? 'text-[20px] font-black' : 'text-[18px] font-normal'}`}
                    onClick={() => switchLoginType('手机登录')}
                  >
                    验证码登录
                    {type === '手机登录' && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: 0,
                        width: '100%',
                        height: '3px',
                        backgroundColor: '#fff'
                      }} />
                    )}
                  </span>
                </div>

                <div className='h-[60%] w-full'>
                  <Form onFinish={handleSubmit} layout='vertical' className='w-full h-full' form={form}>
                    {type === '用户登录' ? (
                      <>
                        <Form.Item
                          label={
                            <span style={formStyle.labelStyle}>
                              账号
                            </span>
                          }
                          style={{ height: '25%' }}
                          required={false}
                          name="name"
                          rules={[
                            { required: true, message: '请输入手机号' },
                            {
                              pattern: /^1[3456789]\d{9}$/,
                              message: '请输入正确的手机号码'
                            }
                          ]}>
                          <Input
                            className="force-bg-color"
                            value={formData.phone}
                            maxLength={11}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="请输入手机号"
                            style={formStyle.inputStyle}
                          />
                        </Form.Item>
                        <Form.Item
                          label={
                            <span style={formStyle.labelStyle}>
                              密码
                            </span>
                          }
                          style={{ height: '24%' }}
                          required={false}
                          name="pwd"
                          rules={[{ required: true, message: '请输入密码' }]}
                        >
                          <Input.Password
                            autoComplete="new-password"
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
                              手机号
                            </span>
                          }
                          style={{ height: '25%' }}
                          required={false}
                          name="phone"
                          rules={[{ required: true, message: '请输入账请输入手机号号' }]}>
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
                              验证码
                            </span>
                          }
                          style={{ height: '24%' }}
                          required={false}
                          name="code"
                          rules={[
                            { required: true, message: '请输入验证码' },
                            {
                              pattern: /^\d{6}$/,
                              message: '请输入6位数字验证码'
                            }
                          ]}
                        >
                          <div className="flex items-center justify-between w-full">
                            <Input
                              className="force-bg-color"
                              value={formData.code}
                              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                              placeholder="请输入验证码"
                              style={formStyle.inputStyle}
                              maxLength={6}
                            />
                            <Button
                              className="verification-code-btn"
                              onClick={sendVerificationCode}
                              disabled={isCounting || !isPhoneValid(formData.phone) || codeDisabled}
                            >
                              {isCounting ? `${countdown}秒后重发` : '获取验证码'}
                            </Button>
                          </div>
                        </Form.Item>
                      </>
                    )}

                    {
                      type === '用户登录' ?
                        <Form.Item
                          style={{ height: '8%' }}>
                          <div className="flex items-center justify-between w-full">
                            <Checkbox checked={rememberMe} onChange={(e) => {
                              setRememberMe(e.target.checked)
                              setLocalRememberMe(e.target.checked)
                            }}
                              style={{ '--checked-color': '#419eff' } as CSSProperties} className='custom-checkbox'>
                              <span className="text-[#092C4D] text-[14px]">记住密码</span>
                            </Checkbox>
                            <span className="text-[#002FA7] text-[14px] cursor-pointer" onClick={() => switchForgotPassword(true)}>忘记密码</span>

                          </div>
                        </Form.Item> : null
                    }

                    <Form.Item
                      style={{ height: '10%' }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="w-full h-[46px] login-btn"
                        id={"loginBtn"}
                        loading={loading}
                      >
                        登录
                      </Button>
                    </Form.Item>
                  </Form>
                </div>

                {/* <div className="absolute bottom-[5%] left-0 right-0 h-[5%] text-[#90A0AF] text-[14px] flex items-center justify-center">
                  <span
                    onClick={() => switchPlatformType(platformType === "后台" ? "前台" : "后台")}
                    style={{ cursor: 'pointer' }}
                  >
                    切换至{platformType === "后台" ? "前台" : "后台"}管理系统
                  </span>
                </div> */}
              </div>
            </div>)}
        </div>
      </div>

      <div className='absolute bottom-[30px] left-0 right-0 w-full text-left text-[14px] leading-[20px] text-[rgba(144,160,175,1)] font-[PingFangSC-regular] text-center'>
        {versionNumber}
      </div>
    </div>
  );
};

export default LoginPage5;