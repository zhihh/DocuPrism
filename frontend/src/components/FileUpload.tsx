import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { FileUpload } from '@/types/api';
import { validateFile, validateFiles } from '@/utils/validation';
import { formatBytes, generateUniqueId, parseTextContent } from '@/utils/helpers';

interface FileUploaderProps {
  files: FileUpload[];
  onFilesChange: (files: FileUpload[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // bytes
  allowedTypes?: string[];
}

const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  onFilesChange,
  disabled = false,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['.txt', '.md', '.json']
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateFileStatus = useCallback((fileId: string, updates: Partial<FileUpload>) => {
    onFilesChange(files.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    ));
  }, [files, onFilesChange]);

  const processFile = async (file: File, documentId: number): Promise<FileUpload> => {
    const fileUpload: FileUpload = {
      id: generateUniqueId(),
      file,
      documentId,
      page: 1,
      status: 'pending'
    };

    try {
      // 验证文件
      const validation = validateFile(file);
      if (!validation.isValid) {
        return {
          ...fileUpload,
          status: 'error',
          error: Object.values(validation.errors)[0]
        };
      }

      // 读取文件内容
      const content = await parseTextContent(file);
      
      if (!content || content.trim().length === 0) {
        return {
          ...fileUpload,
          status: 'error',
          error: '文件内容为空'
        };
      }

      if (content.length > 50000) {
        return {
          ...fileUpload,
          status: 'error',
          error: '文件内容过长，请控制在50000字符以内'
        };
      }

      return {
        ...fileUpload,
        content,
        status: 'completed'
      };
    } catch (error) {
      return {
        ...fileUpload,
        status: 'error',
        error: error instanceof Error ? error.message : '文件读取失败'
      };
    }
  };

  const handleFileSelect = async (selectedFiles: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(selectedFiles);
    
    // 检查文件数量限制
    if (files.length + fileArray.length > maxFiles) {
      alert(`最多只能上传${maxFiles}个文件`);
      return;
    }

    // 验证文件
    const validation = validateFiles(fileArray);
    if (!validation.isValid) {
      alert(Object.values(validation.errors)[0]);
      return;
    }

    // 处理文件
    const newFiles: FileUpload[] = [];
    
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const documentId = files.length + newFiles.length + 1;
      
      // 先添加pending状态的文件
      const pendingFile: FileUpload = {
        id: generateUniqueId(),
        file,
        documentId,
        page: 1,
        status: 'processing'
      };
      
      newFiles.push(pendingFile);
    }

    // 添加到文件列表
    onFilesChange([...files, ...newFiles]);

    // 异步处理每个文件
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const fileUpload = newFiles[i];
      
      try {
        const processedFile = await processFile(file, fileUpload.documentId);
        updateFileStatus(fileUpload.id, {
          content: processedFile.content,
          status: processedFile.status,
          error: processedFile.error
        });
      } catch (error) {
        updateFileStatus(fileUpload.id, {
          status: 'error',
          error: '处理文件时发生错误'
        });
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [disabled, files, maxFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      handleFileSelect(selectedFiles);
    }
    // 清空input值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    if (disabled) return;
    onFilesChange(files.filter(file => file.id !== fileId));
  };

  const openFileDialog = () => {
    if (disabled || !fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const getStatusIcon = (status: FileUpload['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: FileUpload['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="w-full">
      {/* 文件上传区域 */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${isDragOver 
            ? 'border-primary-400 bg-primary-50' 
            : disabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <Upload className={`mx-auto h-12 w-12 mb-4 ${
          disabled ? 'text-gray-400' : 'text-gray-500'
        }`} />
        
        <p className={`text-lg font-medium mb-2 ${
          disabled ? 'text-gray-400' : 'text-gray-900'
        }`}>
          {isDragOver ? '释放文件以上传' : '拖拽文件到此处或点击选择'}
        </p>
        
        <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
          支持 {allowedTypes.join(', ')} 格式，单个文件最大 {formatBytes(maxFileSize)}
        </p>
        
        <p className={`text-xs mt-2 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
          已上传 {files.length} / {maxFiles} 个文件
        </p>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            已上传文件 ({files.length})
          </h4>
          
          <div className="space-y-2">
            {files.map((fileUpload) => (
              <div
                key={fileUpload.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg border
                  ${getStatusColor(fileUpload.status)}
                `}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getStatusIcon(fileUpload.status)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      文档 {fileUpload.documentId}: {fileUpload.file.name}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatBytes(fileUpload.file.size)}</span>
                      <span>页 {fileUpload.page}</span>
                      {fileUpload.content && (
                        <span>{fileUpload.content.length} 字符</span>
                      )}
                    </div>
                    
                    {fileUpload.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {fileUpload.error}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeFile(fileUpload.id)}
                  disabled={disabled}
                  className="ml-3 p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="移除文件"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;