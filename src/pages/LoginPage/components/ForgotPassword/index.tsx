import React, { CSSProperties, useState, useRef } from 'react';

import { message } from 'antd';
import { Form, Input, Button, Checkbox, Divider } from 'antd';
import md5 from 'js-md5';

import {
  getPhoneCode,
  postForgetPwd,
  getForgetPwdCode,
  getSendSmsCode,
  forgetPassword,
} from '@/api/loginConfiguration';

interface ForgotPasswordProps {
  switchForgotPassword: (type: boolean) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ switchForgotPassword }) => {
  const [isCounting, setIsCounting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [formData, setFormData] = useState({
    phone: '',
    code: '',
    newPassword: '',
    reEnterPwd: '',
  });
  const [form] = Form.useForm();
  const regxMsg = useRef('密码长度为 6 到 20 个数字或字母组成');

  const formStyle = {
    labelStyle: {
      fontWeight: 500,
      fontSize: '18px',
      color: '#092C4D',
      display: 'flex',
      alignItems: 'center',
      fontFamily: 'PingFangSC-medium',
    },
    inputStyle: {
      width: '100%',
      height: '46px',
      backgroundColor: '#fff !important',
      border: '1px solid rgba(195,203,214,1)',
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
      },
      '&:focus': {
        backgroundColor: '#e8f0fe !important',
      },
    },
  };

  const globalStyles = `
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

    .ant-form-item-has-error .ant-input,
    .ant-form-item-has-error .ant-input-affix-wrapper,
    .ant-form-item-has-error .ant-input:hover,
    .ant-form-item-has-error .ant-input-affix-wrapper:hover {
      border-color: #ff4d4f !important;
    }

    .ant-form-item-has-error .ant-input:focus,
    .ant-form-item-has-error .ant-input-affix-wrapper:focus,
    .ant-form-item-has-error .ant-input-focused,
    .ant-form-item-has-error .ant-input-affix-wrapper-focused {
      border-color: #ff4d4f !important;
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2) !important;
    }

    .verification-code-btn:not(:disabled):hover,
    .verification-code-btn:not(:disabled):active {
        background-color: rgba(0,47,167,1) !important;
        color: rgba(255,255,255,1) !important;
        border-color: rgba(0,47,167,1) !important;
    }

    .verification-code-btn:disabled {
        background-color: #f5f5f5 !important;
        border-color: #d9d9d9 !important;
        color: rgba(0, 0, 0, 0.25) !important;
    }
  `;

  // 确认修改
  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const param = {
        mobile: formData.phone,
        code: formData.code,
        password: md5(formData.reEnterPwd),
      };
      const response = await forgetPassword(param);
      const res = response.data;
      if (res.code === 200) {
        message.success('密码重置成功，请使用新密码登录');
        switchForgotPassword(false);
      } else {
        message.error(res?.msg || res?.message);
      }
    } catch (error) {
      // message.error(`修改密码失败：${error}`);
    }
  };

  // 发送验证码
  const sendVerificationCode = async () => {
    if (isCounting) return;

    try {
      await form.validateFields(['phone']);
      const phoneRegex = /^1[3456789]\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        message.warning('手机号输入格式有误');
        form.setFields([
          {
            name: 'phone',
            errors: ['手机号输入格式有误'],
          },
        ]);
        return;
      }

      const params = {
        mobile: formData.phone,
        scene: 2,
      };
      const response = await getSendSmsCode(params);
      const res = response.data;
      if (res.code === 200) {
        startCountdown();
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      message.error('请先输入正确的手机号');
    }
  };

  // 验证码倒计时
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

  const checkPassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject('请输入密码');
    }
    if (!checkConfig(value)) {
      return Promise.reject(new Error(regxMsg.current));
    }
    return Promise.resolve();
  };

  const checkConfirmPassword = ({ getFieldValue }: any) => ({
    validator(_: any, value: string) {
      if (!value) {
        return Promise.reject('请再次输入密码');
      }
      if (getFieldValue('newPassword') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('新密码和确认密码不一致'));
    },
  });

  const checkConfig = (password: string) => {
    const chineseOrSpaceRegex = /[\u4e00-\u9fa5\s]/;
    if (password.length < 6 || password.length > 20 || chineseOrSpaceRegex.test(password)) {
      regxMsg.current = `请输入 6-20 位密码，不包含中文及空格。`;
      return false;
    }
    return true;
  };

  const isPhoneValid = () => {
    const phoneRegex = /^1[3456789]\d{9}$/;
    return phoneRegex.test(formData.phone);
  };

  return (
    <div className="w-full h-full flex justify-center items-center">
      <style>{globalStyles}</style>
      <div className="w-[64%] h-full relative">
        <div className="h-[10%]"></div>
        <div className="h-[11%]">
          <span
            style={{
              fontFamily: 'PingFangSC-medium',
            }}
            className="text-[#092C4D] mr-[20px] cursor-pointer text-[26px] font-medium"
          >
            忘记密码
          </span>
        </div>
        <div className="h-[65%] w-full">
          <Form form={form} onFinish={handleSubmit} layout="vertical" className="w-full h-full">
            <Form.Item
              label={<span style={formStyle.labelStyle}>手机号</span>}
              style={{ height: '18%' }}
              name="phone"
              required={false}
              rules={[
                { required: true, message: '请输入手机号' },
                {
                  pattern: /^1[3456789]\d{9}$/,
                  message: '请输入正确的手机号码',
                },
              ]}
            >
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
              label={<span style={formStyle.labelStyle}>验证码</span>}
              style={{ height: '18%' }}
              name="code"
              required={false}
              rules={[
                { required: true, message: '请输入验证码' },
                {
                  pattern: /^\d{6}$/,
                  message: '请输入6位数字验证码',
                },
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
                  className="ml-[20px] verification-code-btn"
                  onClick={sendVerificationCode}
                  disabled={isCounting || !isPhoneValid()}
                  style={{
                    backgroundColor: isPhoneValid() ? '#fff' : '#f5f5f5',
                    borderColor: isPhoneValid() ? '#002FA7' : '#d9d9d9',
                    borderRadius: '6px',
                    color: isPhoneValid() ? '#002FA7' : 'rgba(0, 0, 0, 0.25)',
                    fontSize: '16px',
                    height: '46px',
                    cursor: isCounting || !isPhoneValid() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isCounting ? `${countdown}秒后重发` : '获取验证码'}
                </Button>
              </div>
            </Form.Item>
            <Form.Item
              label={<span style={formStyle.labelStyle}>修改密码</span>}
              style={{ height: '15%' }}
              name="newPassword"
              rules={[{ validator: checkPassword }]}
            >
              <Input.Password
                autoComplete="new-password"
                className="force-bg-color"
                maxLength={20}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="请输入密码"
                style={formStyle.inputStyle}
              />
            </Form.Item>
            <Form.Item
              style={{ height: '12%' }}
              name="reEnterPwd"
              rules={[checkConfirmPassword({ getFieldValue: form.getFieldValue })]}
            >
              <Input.Password
                autoComplete="new-password"
                className="force-bg-color"
                maxLength={20}
                value={formData.reEnterPwd}
                onChange={(e) => setFormData({ ...formData, reEnterPwd: e.target.value })}
                placeholder="再次输入密码"
                style={formStyle.inputStyle}
              />
            </Form.Item>

            <Form.Item style={{ height: '10%' }}>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-[46px]"
                style={
                  {
                    backgroundColor: '#012fa7',
                    borderColor: '#012fa7',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '18px',
                    transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
                    '&:hover': {
                      backgroundColor: '#012fa7',
                      borderColor: '#012fa7',
                    },
                    '&:active': {
                      backgroundColor: '#012fa7',
                      borderColor: '#012fa7',
                    },
                    '&:focus': {
                      outline: 'none',
                    },
                  } as CSSProperties
                }
              >
                确认修改
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div
          className="h-[8%] w-full text-center text-[#5A6875] text-[14px] cursor-pointer"
          onClick={() => switchForgotPassword(false)}
        >
          返回登录
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
