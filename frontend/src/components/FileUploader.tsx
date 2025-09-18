import React from 'react';
import { Upload, FileText, AlertCircle, X, File, Image } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { FileUpload } from '@/types/api';
import { formatFileSize, validateFileType, parseTextContent, generateUniqueId } from '@/utils/helpers';

interface FileUploaderProps {
  files: FileUpload[];
  onFilesChange: (files: FileUpload[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  mode?: 'legacy' | 'backend'; // 新增模式选择
}

const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  onFilesChange,
  disabled = false,
  maxFiles = 10,
  mode = 'backend' // 默认使用backend模式
}) => {
  // 根据模式确定支持的文件类型
  const allowedTypes = mode === 'legacy' 
    ? ['.txt', '.md', '.json']
    : ['.txt', '.md', '.json', '.pdf', '.docx', '.png', '.jpg', '.jpeg'];

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return <File className="h-5 w-5 text-red-500 flex-shrink-0" />;
      case 'docx':
        return <File className="h-5 w-5 text-blue-500 flex-shrink-0" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <Image className="h-5 w-5 text-green-500 flex-shrink-0" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />;
    }
  };

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;

    const newFiles: FileUpload[] = [];

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      
      // 验证文件类型
      if (!validateFileType(file, allowedTypes)) {
        // 为不支持的文件创建错误记录
        const fileUpload: FileUpload = {
          id: generateUniqueId(),
          file,
          documentId: files.length + newFiles.length + 1,
          page: 1,
          status: 'error',
          error: `不支持的文件格式: ${file.name.split('.').pop()}`,
          mode
        };
        newFiles.push(fileUpload);
        continue;
      }

      try {
        let content: string | undefined;
        let status: 'uploading' | 'completed' | 'error' = 'uploading';
        let error: string | undefined;

        if (mode === 'legacy') {
          // 传统模式：客户端解析文本文件
          if (['.txt', '.md', '.json'].some(ext => file.name.toLowerCase().endsWith(ext))) {
            content = await parseTextContent(file);
            status = 'completed';
          } else {
            status = 'error';
            error = '传统模式仅支持文本文件';
          }
        } else {
          // Backend模式：支持所有格式，文件将发送到后端处理
          if (['.txt', '.md', '.json'].some(ext => file.name.toLowerCase().endsWith(ext))) {
            // 文本文件仍可在前端预览
            try {
              content = await parseTextContent(file);
            } catch {
              // 如果前端解析失败，后端仍可处理
            }
          }
          status = 'completed'; // 标记为完成，实际处理在分析时进行
        }
        
        const fileUpload: FileUpload = {
          id: generateUniqueId(),
          file,
          documentId: files.length + newFiles.length + 1,
          page: 1,
          content,
          status,
          error,
          mode
        };

        newFiles.push(fileUpload);
      } catch (error) {
        const fileUpload: FileUpload = {
          id: generateUniqueId(),
          file,
          documentId: files.length + newFiles.length + 1,
          page: 1,
          status: 'error',
          error: '文件处理失败',
          mode
        };

        newFiles.push(fileUpload);
      }
    }

    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange, disabled, allowedTypes, mode]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: mode === 'legacy' ? {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/json': ['.json']
    } : {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/json': ['.json'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    disabled,
    maxFiles: maxFiles - files.length,
    maxSize: 50 * 1024 * 1024 // 50MB for larger documents
  });

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    // 重新分配documentId
    const reindexedFiles = updatedFiles.map((file, index) => ({
      ...file,
      documentId: index + 1
    }));
    onFilesChange(reindexedFiles);
  };

  const getDropzoneStyle = () => {
    let baseStyle = "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer";
    
    if (disabled) {
      return `${baseStyle} border-gray-200 bg-gray-50 cursor-not-allowed`;
    }
    
    if (isDragReject) {
      return `${baseStyle} border-red-300 bg-red-50`;
    }
    
    if (isDragActive) {
      return `${baseStyle} border-primary-400 bg-primary-50`;
    }
    
    return `${baseStyle} border-gray-300 hover:border-primary-400 hover:bg-primary-50`;
  };

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={getDropzoneStyle()}>
        <input {...getInputProps()} />
        <Upload className={`mx-auto h-12 w-12 mb-4 ${
          disabled ? 'text-gray-400' : 'text-gray-500'
        }`} />
        
        {isDragActive ? (
          <p className="text-lg font-medium text-primary-600">
            放开文件以上传...
          </p>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              拖拽文件到此处或点击选择文件
            </p>
            <p className="text-sm text-gray-500">
              {mode === 'legacy' 
                ? '支持 TXT、MD、JSON 格式，最大 10MB'
                : '支持 PDF、Word、TXT、MD、JSON、图片格式，最大 50MB'
              }
            </p>
            <p className="text-xs text-gray-400 mt-1">
              最多可上传 {maxFiles} 个文件，当前已上传 {files.length} 个
            </p>
            {mode === 'backend' && (
              <p className="text-xs text-blue-600 mt-2">
                🚀 支持 PDF/Word 文档和图片 OCR 识别
              </p>
            )}
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">
            已上传文件 ({files.length})
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.file.name)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      文档 {file.documentId}: {file.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.file.size)}
                      {file.content && ` • ${file.content.length} 字符`}
                      {!file.content && mode === 'backend' && file.status === 'completed' && ' • 待后端处理'}
                    </p>
                    {file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    {file.status === 'completed' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        {file.content ? '已解析' : '就绪'}
                      </span>
                    )}
                    {file.status === 'uploading' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        处理中...
                      </span>
                    )}
                    {file.status === 'error' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        错误
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(file.id)}
                  className="ml-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={disabled}
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