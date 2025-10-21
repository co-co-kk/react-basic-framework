// import { api } from "../../api";
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

// 查询登录页列表
export function getLoginList() {
  return api.get('/api/platform/usercenter/login-page/config/detail');
}

// 查询登录是否管理员
export function getLoginAdmin() {
  return api.get('/api/platform/base/role/isSysRole');
}

// 发送验证码
export function getPhoneCode(params: any) {
  const queryString = buildQueryString(params);
  return api.get('/api/platform/usercenter/SysUserAcc/loginByPhone_sendVc?' + queryString);
}

// 登录验证
export function getLoginVerification(params: any) {
  const queryString = buildQueryString(params);
  return api.get('/api/platform/usercenter/sso/doLogin?' + queryString);
}

// 获取token
export function getLoginToken(params: any) {
  const queryString = buildQueryString(params);
  return api.get('/api/platform/oauth/sso/doLoginByTicketUpdate?' + queryString);
}

// 验证码登录
export const postPhoneLogin = (phone: string, code: string) => {
  return api.post(`api/platform/usercenter/BaseDblink/loginByPhone_ok?phone=${phone}&vc=${code}&platform=6`, {});
};

// 忘记密码验证码
export function getForgetPwdCode(params: any) {
  const queryString = buildQueryString(params);
  return api.get('/api/platform/usercenter/SysUserAcc/resetPwdByPhone_sendVc?' + queryString);
}

// 忘记密码确认修改
export function postForgetPwd(params: any) {
  const queryString = buildQueryString(params);
  return api.get('/api/platform/usercenter/SysUserAcc/reset?' + queryString);
}
// 新-忘记密码确认修改
export function forgetPassword(data: any) {
  // const queryString = buildQueryString(params)
  // return api.get('/api/platform/auth/v1/forget-password?' + queryString)
  return api.post('/api/platform/auth/v1/forget-password', data);
}

// 新登录验证
export function authV1Login(data: any) {
  // const queryString = buildQueryString(params)
  return api.post('/api/platform/auth/v1/login', data);
}

// 新发送验证码
export function getSendSmsCode(params: any) {
  // const queryString = buildQueryString(params)
  return api.post('/api/platform/auth/v1/send-sms-code', params);
}
// 新验证码登录
export const smsLoginPhoneLogin = (mobile: string, code: string) => {
  return api.post(`/api/platform/auth/v1/sms-login`, { mobile, code });
};

//免密登录
export const loginByAppKey = (data: any) => {
  return api.post(`/api/platform/openapi/application/loginByApiKey`, data);
};
export const getCurrentUserInfo = async () => {
  return await api.get<any>(`/api/platform/admin/v1/user/info`);
}
