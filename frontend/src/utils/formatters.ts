/**
 * 数据格式化工具函数
 */

/**
 * 格式化文件大小
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * 格式化时间戳
 */
export const formatTimestamp = (timestamp: number | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 格式化相对时间
 */
export const formatRelativeTime = (timestamp: number | Date): string => {
  const now = new Date();
  const target = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const diffMs = now.getTime() - target.getTime();

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}周前`;
  } else if (diffMonths < 12) {
    return `${diffMonths}个月前`;
  } else {
    return `${diffYears}年前`;
  }
};

/**
 * 格式化数字
 */
export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * 格式化百分比
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * 格式化货币
 */
export const formatCurrency = (amount: number, currency: string = 'CNY'): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * 格式化文本长度截断
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * 格式化换行文本为HTML
 */
export const formatTextToHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\n/g, '<br>');
};

/**
 * 格式化手机号（隐藏中间四位）
 */
export const formatPhoneNumber = (phone: string): string => {
  if (phone.length !== 11) {
    return phone;
  }
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

/**
 * 格式化邮箱（隐藏用户名部分字符）
 */
export const formatEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (!username || !domain) {
    return email;
  }

  if (username.length <= 3) {
    return `${username[0]}***@${domain}`;
  }

  const visibleStart = username.substring(0, 2);
  const visibleEnd = username.substring(username.length - 1);
  return `${visibleStart}***${visibleEnd}@${domain}`;
};

/**
 * 格式化ID（身份证号等隐藏中间部分）
 */
export const formatIdNumber = (id: string): string => {
  if (id.length < 8) {
    return id;
  }

  const start = id.substring(0, 3);
  const end = id.substring(id.length - 4);
  const middle = '*'.repeat(id.length - 7);
  
  return `${start}${middle}${end}`;
};

/**
 * 格式化银行卡号（每四位一组）
 */
export const formatBankCard = (cardNumber: string): string => {
  return cardNumber.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
};

/**
 * 格式化代码高亮
 */
export const formatCodeBlock = (code: string, language: string = 'text'): string => {
  // 这里可以集成代码高亮库
  return `<pre><code class="language-${language}">${formatTextToHtml(code)}</code></pre>`;
};

/**
 * 格式化JSON数据
 */
export const formatJson = (data: any, indent: number = 2): string => {
  try {
    return JSON.stringify(data, null, indent);
  } catch (error) {
    return String(data);
  }
};

/**
 * 格式化URL参数
 */
export const formatUrlParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const paramString = searchParams.toString();
  return paramString ? `?${paramString}` : '';
};

/**
 * 格式化文件路径
 */
export const formatFilePath = (path: string): string => {
  // 标准化路径分隔符
  return path.replace(/\\/g, '/');
};

/**
 * 格式化颜色值
 */
export const formatColorToHex = (color: string): string => {
  // 将颜色值转换为十六进制格式
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return color;

  ctx.fillStyle = color;
  return ctx.fillStyle;
};

/**
 * 格式化数组为文本列表
 */
export const formatArrayToList = (
  items: string[], 
  separator: string = '、', 
  lastSeparator: string = '和'
): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(lastSeparator);
  
  const allButLast = items.slice(0, -1).join(separator);
  const last = items[items.length - 1];
  
  return `${allButLast}${lastSeparator}${last}`;
};

/**
 * 格式化键值对为描述文本
 */
export const formatObjectToDescription = (
  obj: Record<string, any>, 
  keyValueSeparator: string = ': ',
  itemSeparator: string = ', '
): string => {
  return Object.entries(obj)
    .map(([key, value]) => `${key}${keyValueSeparator}${value}`)
    .join(itemSeparator);
};