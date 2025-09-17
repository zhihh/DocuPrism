/**
 * 数据验证工具函数
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

/**
 * 验证单个字段
 */
export const validateField = (value: any, rule: ValidationRule): string | null => {
  // 必填验证
  if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return '此字段为必填项';
  }

  // 如果不是必填且值为空，跳过其他验证
  if (!rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return null;
  }

  // 字符串类型验证
  if (typeof value === 'string') {
    // 最小长度验证
    if (rule.minLength && value.length < rule.minLength) {
      return `最少需要${rule.minLength}个字符`;
    }

    // 最大长度验证
    if (rule.maxLength && value.length > rule.maxLength) {
      return `最多允许${rule.maxLength}个字符`;
    }

    // 正则表达式验证
    if (rule.pattern && !rule.pattern.test(value)) {
      return '格式不正确';
    }
  }

  // 自定义验证
  if (rule.custom) {
    const result = rule.custom(value);
    if (typeof result === 'string') {
      return result;
    }
    if (result === false) {
      return '验证失败';
    }
  }

  return null;
};

/**
 * 验证对象
 */
export const validateObject = (data: any, schema: ValidationSchema): ValidationResult => {
  const errors: { [key: string]: string } = {};
  let isValid = true;

  for (const [field, rule] of Object.entries(schema)) {
    const error = validateField(data[field], rule);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
};

/**
 * 文档内容验证
 */
export const validateDocumentContent = (content: string): ValidationResult => {
  const schema: ValidationSchema = {
    content: {
      required: true,
      minLength: 10,
      maxLength: 50000,
      custom: (value: string) => {
        // 检查是否包含有效文本
        const trimmed = value.trim();
        if (trimmed.length === 0) {
          return '文档内容不能为空';
        }

        // 检查是否包含足够的文本内容
        const wordCount = trimmed.split(/\s+/).length;
        if (wordCount < 3) {
          return '文档内容过短，至少需要3个词';
        }

        return true;
      }
    }
  };

  return validateObject({ content }, schema);
};

/**
 * 文件验证
 */
export const validateFile = (file: File): ValidationResult => {
  const errors: { [key: string]: string } = {};
  let isValid = true;

  // 文件大小验证 (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.size = '文件大小不能超过10MB';
    isValid = false;
  }

  // 文件类型验证
  const allowedTypes = ['text/plain', 'text/markdown', 'application/json'];
  const allowedExtensions = ['.txt', '.md', '.json'];
  
  const isValidType = allowedTypes.some(type => file.type === type) ||
                     allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  
  if (!isValidType) {
    errors.type = '只支持 TXT、MD、JSON 格式文件';
    isValid = false;
  }

  // 文件名验证
  if (file.name.length > 255) {
    errors.name = '文件名过长';
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * 批量文件验证
 */
export const validateFiles = (files: File[]): ValidationResult => {
  const errors: { [key: string]: string } = {};
  let isValid = true;

  // 文件数量验证
  if (files.length === 0) {
    errors.count = '请至少选择一个文件';
    isValid = false;
  }

  if (files.length > 10) {
    errors.count = '最多只能选择10个文件';
    isValid = false;
  }

  // 验证每个文件
  files.forEach((file, index) => {
    const fileValidation = validateFile(file);
    if (!fileValidation.isValid) {
      Object.entries(fileValidation.errors).forEach(([key, message]) => {
        errors[`file_${index}_${key}`] = `文件 "${file.name}": ${message}`;
      });
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * URL验证
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 邮箱验证
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 手机号验证（中国大陆）
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 密码强度验证
 */
export const validatePasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('密码长度至少8位');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含小写字母');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含大写字母');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含数字');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含特殊字符');
  }

  return {
    score,
    feedback,
    isStrong: score >= 4
  };
};