import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  actions?: ToastAction[];
  persistent?: boolean;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
  style?: 'primary' | 'secondary';
}

interface ToastManagerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
  onAction: (action: ToastAction) => void;
}

// Toast图标映射
const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

// Toast颜色映射
const toastColors = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-400',
    title: 'text-green-800',
    message: 'text-green-600',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-400',
    title: 'text-red-800',
    message: 'text-red-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-400',
    title: 'text-yellow-800',
    message: 'text-yellow-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-400',
    title: 'text-blue-800',
    message: 'text-blue-600',
  },
};

// 单个Toast组件
const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const IconComponent = toastIcons[toast.type];
  const colors = toastColors[toast.type];

  useEffect(() => {
    // 入场动画
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast.persistent && toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.persistent]);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 150); // 等待退场动画完成
  }, [toast.id, onClose]);

  const handleActionClick = useCallback((action: ToastAction) => {
    onAction(action);
    if (!toast.persistent) {
      handleClose();
    }
  }, [onAction, toast.persistent, handleClose]);

  return (
    <div
      className={`
        transform transition-all duration-150 ease-in-out mb-4
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`
        max-w-sm w-full rounded-lg border shadow-lg p-4
        ${colors.bg} ${colors.border}
      `}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${colors.icon}`} />
          </div>
          
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${colors.title}`}>
              {toast.title}
            </p>
            
            {toast.message && (
              <p className={`mt-1 text-sm ${colors.message}`}>
                {toast.message}
              </p>
            )}
            
            {toast.actions && toast.actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {toast.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleActionClick(action)}
                    className={`
                      text-xs font-medium px-3 py-1 rounded-md transition-colors
                      ${action.style === 'primary' 
                        ? `bg-${toast.type}-600 text-white hover:bg-${toast.type}-700`
                        : `bg-white border border-gray-300 text-gray-700 hover:bg-gray-50`
                      }
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`
                inline-flex rounded-md p-1.5 transition-colors
                ${colors.message} hover:${colors.title}
              `}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast管理器组件
const ToastManager: React.FC<ToastManagerProps> = ({ 
  position = 'top-right',
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 获取位置样式
  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50 pointer-events-none';
    
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'top-center':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-center':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  // 添加Toast
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      id,
      duration: 5000, // 默认5秒
      ...toast,
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      // 限制最大数量
      return updated.slice(0, maxToasts);
    });

    return id;
  }, [maxToasts]);

  // 移除Toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // 清空所有Toast
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // 处理Action点击
  const handleActionClick = useCallback((action: ToastAction) => {
    action.onClick();
  }, []);

  // 将方法暴露到全局，供其他组件调用
  useEffect(() => {
    const toastManager = {
      success: (title: string, message?: string, options?: Partial<Toast>) => 
        addToast({ type: 'success', title, message, ...options }),
      
      error: (title: string, message?: string, options?: Partial<Toast>) => 
        addToast({ type: 'error', title, message, ...options }),
      
      warning: (title: string, message?: string, options?: Partial<Toast>) => 
        addToast({ type: 'warning', title, message, ...options }),
      
      info: (title: string, message?: string, options?: Partial<Toast>) => 
        addToast({ type: 'info', title, message, ...options }),
      
      custom: (toast: Omit<Toast, 'id'>) => addToast(toast),
      
      remove: removeToast,
      clear: clearToasts,
    };

    // 挂载到window对象
    (window as any).toast = toastManager;

    return () => {
      delete (window as any).toast;
    };
  }, [addToast, removeToast, clearToasts]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={getPositionClasses()}>
      <div className="pointer-events-auto">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={removeToast}
            onAction={handleActionClick}
          />
        ))}
      </div>
    </div>
  );
};

// Hook for using toast
export const useToast = () => {
  const toast = (window as any).toast;
  
  if (!toast) {
    console.warn('Toast manager not initialized. Make sure ToastManager is rendered in your app.');
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
      custom: () => {},
      remove: () => {},
      clear: () => {},
    };
  }

  return toast;
};

export default ToastManager;