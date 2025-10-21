// 记住密码相关的常量
export const REMEMBER_ME_KEY = 'rememberMe';
export const SAVED_USERNAME_KEY = 'savedUsername';
export const SAVED_PASSWORD_KEY = 'savedPassword';

// 导入加密工具
import { encryptText, decryptText } from './cryptoUtils';

/**
 * 设置记住密码
 */
export const setLocalRememberMe = (rememberMe: boolean) => {
    localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
};

/**
 * 清除认证数据但保留记住密码信息
 * 这个函数会清除localStorage中的所有数据，然后恢复记住密码相关的信息
 */
export const clearAuthDataPreserveCredentials = () => {
    // 保存记住密码信息
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
    const savedUsername = localStorage.getItem(SAVED_USERNAME_KEY);
    const savedPassword = localStorage.getItem(SAVED_PASSWORD_KEY);

    // 清除所有localStorage
    localStorage.clear();

    // if (rememberMe === 'true') {
    //     setLocalRememberMe(true);
    // }

    // 恢复记住密码信息
    if (rememberMe === 'true') {
        setLocalRememberMe(true);
        if (savedUsername) {
            localStorage.setItem(SAVED_USERNAME_KEY, savedUsername);
        }
        if (savedPassword) {
            localStorage.setItem(SAVED_PASSWORD_KEY, savedPassword);
        }
    }
};



/**
 * 保存用户凭据到localStorage（密码会被加密存储）
 * @param username 用户名或手机号
 * @param password 密码（可选，手机登录时为空）
 */
export const saveCredentials = (username: string, password: string = '') => {
    // setLocalRememberMe(true);
    localStorage.setItem(SAVED_USERNAME_KEY, username);

    // 对密码进行加密存储
    if (password) {
        const encryptedPassword = encryptText(password);
        localStorage.setItem(SAVED_PASSWORD_KEY, encryptedPassword);
    } else {
        localStorage.setItem(SAVED_PASSWORD_KEY, '');
    }

};

/**
 * 清除保存的凭据
 */
export const clearSavedCredentials = () => {
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem(SAVED_USERNAME_KEY);
    localStorage.removeItem(SAVED_PASSWORD_KEY);
};

/**
 * 从localStorage加载保存的凭据（密码会被自动解密）
 * @returns 包含记住密码状态和凭据信息的对象
 */
export const loadSavedCredentials = () => {
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);

    if (rememberMe === 'true') {
        const savedUsername = localStorage.getItem(SAVED_USERNAME_KEY);
        const savedPassword = localStorage.getItem(SAVED_PASSWORD_KEY);
        // if (savedUsername) {
        // 解密密码
        let decryptedPassword = '';
        if (savedPassword) {
            try {
                decryptedPassword = decryptText(savedPassword);
            } catch (error) {
                console.error('密码解密失败:', error);
                decryptedPassword = '';
            }
        }


        const result = {
            rememberMe: true,
            username: savedUsername,
            password: decryptedPassword,
            // isPhone: savedUsername.length === 11 && /^\d+$/.test(savedUsername)
        };
        return result;
        // }
    }

    return {
        rememberMe: false,
        username: '',
        password: '',
        // isPhone: false
    };
};
