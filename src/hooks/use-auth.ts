import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * 身份验证自定义 Hook
 * 管理用户登录状态、token 存储和认证逻辑
 * @returns {AuthState & AuthActions} 认证状态和相关操作方法
 */
export function useAuth() {
  const navigate = useNavigate();

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
  });

  /**
   * 用户登录
   * @param credentials 登录凭据
   */
  const login = useCallback(
    async (credentials: { username: string; password: string }) => {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      try {
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser: User = {
          id: '1',
          name: credentials.username,
          email: `${credentials.username}@example.com`,
        };

        const mockToken = `token_${Date.now()}`;

        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));

        setAuthState({
          user: mockUser,
          token: mockToken,
          isAuthenticated: true,
          isLoading: false,
        });

        navigate('/user');
      } catch (error) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    [navigate],
  );

  /**
   * 用户退出登录
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });

    navigate('/login');
  }, [navigate]);

  /**
   * 初始化认证状态
   * 从本地存储恢复用户信息
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        setAuthState((prev) => ({
          ...prev,
          user,
          token,
          isAuthenticated: true,
        }));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        logout();
      }
    }
  }, [logout]);

  return {
    ...authState,
    login,
    logout,
  };
}
