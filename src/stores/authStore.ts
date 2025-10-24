// authStore.js
// import { LANGFLOW_ACCESS_TOKEN } from "@/constants/constants";
import { LOGIN_URL } from "@/utils/urlConfig/config-constants.ts";
import { Cookies } from 'react-cookie';

import { create } from 'zustand';

import { clearAuthDataPreserveCredentials } from '@/utils/authUtils';
// import { getCookie } from '@/utils/getCookie';
import { clearAllCookies } from '@/utils/utils';
// import { useCustomNavigate } from "@/customization/hooks/use-custom-navigate";

const cookies = new Cookies();
const useAuthStore = create<any>((set, get) => ({
  isAuthenticated: !!localStorage.getItem('access_token_lf'),
  autoLogin: null,
  isAdmin: false,
  accessToken: localStorage.getItem('access_token_lf') ?? null,
  userData: null,
  apiKey: cookies.get('apikey_tkn_lflw'),
  authenticationErrorCount: 0,
  isDownline: false,

  setAutoLogin: (autoLogin) => set({ autoLogin }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setGlobalDownline: () => set({ isDownline: true }),
  setIsDownline: (isDownline: boolean) => set({ isDownline }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUserData: (userData) => set({ userData }),
  setApiKey: (apiKey) => set({ apiKey }),
  setAuthenticationErrorCount: (authenticationErrorCount) => set({ authenticationErrorCount }),

  logout: async () => {
    get().setIsAuthenticated(false);
    get().setIsAdmin(false);

    clearAllCookies();

    // 清除认证数据但保留记住密码信息
    clearAuthDataPreserveCredentials();

    set({
      isAdmin: false,
      userData: null,
      accessToken: null,
      isAuthenticated: false,
      autoLogin: false,
      apiKey: null,
    });
    window.location.href = LOGIN_URL;
    // 防止死循环
    // const navigate = useCustomNavigate();
    // navigate("/login");
  },
}));

export default useAuthStore;
