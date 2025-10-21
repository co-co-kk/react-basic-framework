import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
// 本地用户信息
export const getLocalUserInfo = () => {
  return JSON.parse(localStorage.getItem('userInfo') || '{}')
}

/**
 * 清除当前域名下的所有 Cookies，包括不同路径的 Cookie
 */
export const clearAllCookies = () => {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

    // 设置 Cookie 过期时间为过去，并指定 path=/，确保覆盖所有路径
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  console.log("All cookies cleared.");
}
