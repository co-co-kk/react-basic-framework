/**
 * 获取位于 assets/images 目录中的资源文件的完整 URL
 * @param url 资源文件的相对路径
 * @returns 资源文件的完整 URL
 */
export const getAssetsFile = (url: string) => {
  return new URL(`../assets/images/${url}`, import.meta.url).href;
};

/**
 * 在 localStorage 中存储一个可 JSON 序列化的值
 * @param key 存储键
 * @param value 要存储的值
 * @returns void
 */
export function setJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * 从 localStorage 中检索一个可 JSON 序列化的值
 * @param key 存储键
 * @param defaultValue 如果键不存在或解析失败时返回的默认值
 * @returns 检索到的值或默认值
 */
export function getJSON<T>(key: string, defaultValue: T | null = null): T | null {
  const str = localStorage.getItem(key);
  if (!str) return defaultValue;
  try {
    return JSON.parse(str) as T;
  } catch {
    return defaultValue;
  }
}
/**
 * 从 localStorage 中删除一个项目
 * @param key 存储键
 * @returns void
 */
export function remove(key: string) {
  localStorage.removeItem(key);
}

/**
 * 将日期格式化为可读字符串
 * @param date 要格式化的日期
 * @param locale 使用的语言环境
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number | string, locale: string = 'zh-CN') {
  const d = new Date(date);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
}
/**
 * 将日期转换为 ISO 8601 字符串
 * @param date 要转换的日期
 * @returns ISO 8601 格式的字符串
 */
export function toISO(date: Date | number | string) {
  const d = new Date(date);
  return d.toISOString();
}

/**
 * 将数字限制在最小值和最大值之间
 * @param value 要限制的数字
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的数字
 */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * 将数字格式化为货币字符串
 * @param amount 要格式化的数字
 * @param currency 货币代码
 * @param locale 使用的语言环境
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(amount: number, currency: string = 'CNY', locale = 'zh-CN') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

/**
 * 检查给定值是否为空对象
 * @param obj 要检查的值
 * @returns 如果值是空对象则返回true，否则返回false
 */
export function isEmptyObject(obj: unknown): obj is Record<string, never> {
  return !!obj && typeof obj === 'object' && Object.keys(obj as object).length === 0;
}

/**
 * 从对象中选择指定的键并返回新对象
 * @param obj 源对象
 * @param keys 要选择的键
 * @returns 仅包含所选键的新对象
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}
/**
 * 从对象中忽略指定键并返回新对象
 * @param obj 源对象
 * @param keys 要忽略的键
 * @returns 不包含被忽略键的新对象
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj } as T;
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
}


