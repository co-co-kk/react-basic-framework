import { getLOGIN_URL } from "./urlConfig/config-constants";


export const getRagUrl = () => {
  return import.meta.env.VITE_MODE == "production"
    ? window.location.origin
    : "http://localhost:7900";
};
export const getInsightUrl = () => {
  return import.meta.env.VITE_MODE == "production"
    ? window.location.origin
    : "http://localhost:3010";
};


// demoCenter template
export const getTemplateUrl = () => {
  return import.meta.env.VITE_MODE == "production"
    ? window.location.origin
    : "http://localhost:9998";
};


export const getAuthorizeUrl = () => {
  return import.meta.env.VITE_MODE == "production"
    ? window.location.origin
    : "//localhost:3008";
};
// 模型广场
export const getmodeSquarelUrl = () => {
  return import.meta.env.VITE_MODE == "production"
    ? window.location.origin
    : "//localhost:9999";
};
export const getDocUrl = () => {
  return import.meta.env.VITE_MODE == "production"
    ? window.location.origin
    : "//localhost:3009";
};
export const getAssistantUrl = () => {
  return import.meta.env.VITE_MODE == "production"
    ? window.location.origin
    : "//localhost:3001";
};
// 星流
export const getXingFlowUrl = () => {
  return import.meta.env.VITE_MODE == "production"
    ? window.location.origin
    : "//localhost:3002";
};
// 子项目登录过去去login
export const toLogin = () => {
  window.location.href = getLOGIN_URL();
}
