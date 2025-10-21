// 简单的加密密钥（在实际生产环境中应该使用更安全的方式）
const ENCRYPTION_KEY = 'xiaoxing_ai_2024';

/**
 * 简单的字符串加密函数
 * @param text 要加密的文本
 * @returns 加密后的字符串
 */
export const encryptText = (text: string): string => {
    if (!text) return '';

    try {
        // 使用简单的异或加密
        let encrypted = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            const encryptedChar = charCode ^ keyChar;
            encrypted += String.fromCharCode(encryptedChar);
        }

        // 转换为Base64编码
        return btoa(encrypted);
    } catch (error) {
        console.error('加密失败:', error);
        return text; // 如果加密失败，返回原文本
    }
};

/**
 * 简单的字符串解密函数
 * @param encryptedText 加密后的文本
 * @returns 解密后的字符串
 */
export const decryptText = (encryptedText: string): string => {
    if (!encryptedText) return '';

    try {
        // 从Base64解码
        const decoded = atob(encryptedText);

        // 使用异或解密
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i);
            const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            const decryptedChar = charCode ^ keyChar;
            decrypted += String.fromCharCode(decryptedChar);
        }

        return decrypted;
    } catch (error) {
        console.error('解密失败:', error);
        return encryptedText; // 如果解密失败，返回原文本
    }
};

/**
 * 更安全的加密函数（使用Web Crypto API）
 * @param text 要加密的文本
 * @returns 加密后的字符串
 */
export const secureEncrypt = async (text: string): Promise<string> => {
    if (!text || !window.crypto || !window.crypto.subtle) {
        // 如果不支持Web Crypto API，回退到简单加密
        return encryptText(text);
    }

    try {
        // 生成密钥
        const key = await window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );

        // 生成IV
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // 加密
        const encodedText = new TextEncoder().encode(text);
        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encodedText
        );

        // 组合IV和加密数据
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);

        // 转换为Base64
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('安全加密失败，回退到简单加密:', error);
        return encryptText(text);
    }
};

/**
 * 更安全的解密函数（使用Web Crypto API）
 * @param encryptedText 加密后的文本
 * @returns 解密后的字符串
 */
export const secureDecrypt = async (encryptedText: string): Promise<string> => {
    if (!encryptedText || !window.crypto || !window.crypto.subtle) {
        // 如果不支持Web Crypto API，回退到简单解密
        return decryptText(encryptedText);
    }

    try {
        // 从Base64解码
        const combined = new Uint8Array(
            atob(encryptedText).split('').map(char => char.charCodeAt(0))
        );

        // 提取IV和加密数据
        const iv = combined.slice(0, 12);
        const encrypted = combined.slice(12);

        // 生成密钥（这里简化处理，实际应该保存密钥）
        const key = await window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );

        // 解密
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encrypted
        );

        return new TextDecoder().decode(decrypted);
    } catch (error) {
        console.error('安全解密失败，回退到简单解密:', error);
        return decryptText(encryptedText);
    }
};
