import { getUrlIP_PORT } from './toAppAdminH5';

// # 文件资源Url -------- 开发环境
const url = import.meta.env.VITE_PORT_BACK_FLOW;
const xingFlow = import.meta.env.VITE_PORT_XING_FLOW;
const VITE_MODE = import.meta.env.VITE_MODE;
const VITE_PROXY_TARGET_PORT = import.meta.env.VITE_PROXY_TARGET
  ? `${import.meta.env.VITE_PROXY_TARGET}:${import.meta.env.VITE_PORT_BACK}`
  : getUrlIP_PORT();
const uploadUrl = '/api/file/upload/downloadFile?fileName=';
// 退出地址
export const getLOGIN_URL = () => {
  if (VITE_MODE === 'development') {
    return `http://localhost:3000/digitalSprite/login`;
  } else if (VITE_MODE === 'production') {
    return `${VITE_PROXY_TARGET_PORT}/digitalSprite/login`;
  } else {
    return ``;
  }
};
// 跳转到rag的地址
export const getRAG_URL = () => {
  if (VITE_MODE === 'development') {
    return `http://localhost:7900`;
  } else if (VITE_MODE === 'production') {
    return `${VITE_PROXY_TARGET_PORT}`;
  } else {
    return ``;
  }
};

// 跳转到vue3后台管理系统的地址
export const getVUE3_URL = () => {
  if (VITE_MODE === 'development') {
    return `http://localhost:4001`;
  } else if (VITE_MODE === 'production') {
    return `${VITE_PROXY_TARGET_PORT}`;
  } else {
    return ``;
  }
};

// 跳转到vue3后台管理系统的地址
export const getBackendManagement_URL = (type?: string) => {
  if (VITE_MODE === 'development') {
    return `http://localhost:8081/nbms/${type ? 'importAuthorization' : ''}`;
  } else if (VITE_MODE === 'production') {
    return `${VITE_PROXY_TARGET_PORT}/nbms/${type ? 'importAuthorization' : ''}`;
  } else {
    return ``;
  }
};

// 跳转小星本项目
export const getXiaoXing_URL = () => {
  if (VITE_MODE === 'development') {
    return `http://localhost:3000`;
  } else if (VITE_MODE === 'production') {
    return `${VITE_PROXY_TARGET_PORT}`;
  } else {
    return ``;
  }
};

export const BASENAME = '/digitalSprite';
export const comDownloadUrl = import.meta.env.VITE_PROXY_TARGET_JAVA + uploadUrl;
export const API_ROUTES = ['^/api/v1/', '/api/v2/', '/health', '^/api/flow'];
export const BASE_URL_API = url;
export const XING_FLOW_URL_API = xingFlow;

// api/v2 前缀
export const VITE_PORT_BACK_FLOW_V2 = import.meta.env.VITE_PORT_BACK_FLOW_V2;

export const HEALTH_CHECK_URL = '/health_check';
export const DOCS_LINK = 'https://docs.langflow.org';
export const LOGIN_URL = getLOGIN_URL();

export default {
  DOCS_LINK,
  BASENAME,
  API_ROUTES,
  BASE_URL_API,
  XING_FLOW_URL_API,
  VITE_PORT_BACK_FLOW_V2,
  HEALTH_CHECK_URL,
  comDownloadUrl,
  LOGIN_URL,
  getXiaoXing_URL,
};
