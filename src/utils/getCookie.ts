export const getCookie = (cname: any) => {
  const name = cname + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1);
    if (c.startsWith(cname, 0)) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};

export const convertToUTCFormat = (timestamp) => {
  // 确保时间戳被解释为 UTC 时间
  if (!timestamp.endsWith('Z')) {
    timestamp += 'Z'; // 添加 'Z' 表示 UTC 时间
  }
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    console.error(`无效的时间戳: ${timestamp}`);
    return null; // 如果解析失败，返回 null
  }
  // 提取 UTC 时间的各个部分
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要加 1
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  // 拼接为 "YYYY-MM-DD HH:mm:ss UTC" 格式
  const utcTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;

  return utcTimestamp;
};

export const removeUTCSuffix = (timestamp: string): string => {
  // 检查时间戳是否包含 UTC 后缀
  if (timestamp.endsWith(' UTC')) {
    return timestamp.slice(0, -4); // 移除末尾的 " UTC"
  }
  return timestamp; // 如果没有 UTC 后缀，直接返回原字符串
};
