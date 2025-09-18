import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  maxHeight?: number;
  maxSelections?: number;
  groupBy?: boolean;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '请选择...',
  searchable = true,
  clearable = true,
  disabled = false,
  maxHeight = 200,
  maxSelections,
  groupBy = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 过滤选项
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 按组分组选项
  const groupedOptions = groupBy ? 
    filteredOptions.reduce((groups, option) => {
      const group = option.group || '其他';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(option);
      return groups;
    }, {} as Record<string, Option[]>) :
    { '': filteredOptions };

  // 获取选中选项的标签
  const getSelectedLabels = () => {
    return value.map(val => {
      const option = options.find(opt => opt.value === val);
      return option ? option.label : val;
    });
  };

  // 处理选项点击
  const handleOptionClick = (optionValue: string) => {
    if (disabled) return;

    const isSelected = value.includes(optionValue);
    let newValue: string[];

    if (isSelected) {
      newValue = value.filter(val => val !== optionValue);
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return; // 达到最大选择数量
      }
      newValue = [...value, optionValue];
    }

    onChange(newValue);
  };

  // 清空所有选择
  const clearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  // 移除单个选择
  const removeSelection = (valueToRemove: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (disabled) return;
    
    const newValue = value.filter(val => val !== valueToRemove);
    onChange(newValue);
  };

  // 键盘导航
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          handleOptionClick(filteredOptions[highlightedIndex].value);
        } else {
          setIsOpen(!isOpen);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;

      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // 自动聚焦搜索框
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // 重置高亮索引
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
    >
      {/* 选择框 */}
      <div
        className={`
          min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer
          flex items-center justify-between transition-colors
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}
          ${isOpen ? 'border-primary-500 ring-1 ring-primary-200' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {value.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            getSelectedLabels().map((label, index) => (
              <span
                key={value[index]}
                className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded-md"
              >
                {label}
                {!disabled && (
                  <button
                    onClick={(e) => removeSelection(value[index], e)}
                    className="ml-1 hover:text-primary-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))
          )}
        </div>

        <div className="flex items-center space-x-1">
          {clearable && value.length > 0 && !disabled && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <ChevronDown 
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {/* 下拉选项 */}
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ maxHeight: maxHeight }}
        >
          {/* 搜索框 */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索选项..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}

          {/* 选项列表 */}
          <div className="max-h-48 overflow-y-auto">
            {Object.keys(groupedOptions).length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                没有找到匹配的选项
              </div>
            ) : (
              Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                <div key={groupName}>
                  {groupBy && groupName && (
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200">
                      {groupName}
                    </div>
                  )}
                  
                  {groupOptions.map((option) => {
                    const isSelected = value.includes(option.value);
                    const globalIndex = filteredOptions.findIndex(opt => opt.value === option.value);
                    const isHighlighted = globalIndex === highlightedIndex;
                    
                    return (
                      <div
                        key={option.value}
                        className={`
                          px-3 py-2 cursor-pointer flex items-center justify-between text-sm
                          ${option.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'}
                          ${isHighlighted ? 'bg-primary-50' : 'hover:bg-gray-50'}
                          ${isSelected ? 'bg-primary-100 text-primary-900' : ''}
                        `}
                        onClick={() => !option.disabled && handleOptionClick(option.value)}
                      >
                        <span>{option.label}</span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* 选择统计 */}
          {(maxSelections || value.length > 0) && (
            <div className="px-3 py-2 border-t border-gray-200 text-xs text-gray-500">
              已选择 {value.length} 项
              {maxSelections && ` / ${maxSelections}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;