import React from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  isActive?: boolean;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  isActive = false,
  showLabel = true,
  label,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const getStatusIcon = () => {
    if (progress === 100) {
      return <CheckCircle className="h-4 w-4 text-success-600" />;
    }
    if (isActive) {
      return <Loader2 className="h-4 w-4 text-primary-600 animate-spin" />;
    }
    return null;
  };

  const getProgressColor = () => {
    if (progress === 100) return 'bg-success-600';
    if (isActive) return 'bg-primary-600';
    return 'bg-gray-400';
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label || '分析进度'}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {Math.round(progress)}%
            </span>
            {getStatusIcon()}
          </div>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} transition-all duration-300 ease-out ${getProgressColor()}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;