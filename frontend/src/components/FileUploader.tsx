import React from 'react';
import { Upload, FileText, AlertCircle, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { FileUpload } from '@/types/api';
import { formatFileSize, validateFileType, parseTextContent, generateUniqueId } from '@/utils/helpers';

interface FileUploaderProps {
  files: FileUpload[];
  onFilesChange: (files: FileUpload[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  onFilesChange,
  disabled = false,
  maxFiles = 10
}) => {
  const allowedTypes = ['.txt', '.md', '.json'];

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;

    const newFiles: FileUpload[] = [];

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      
      // 验证文件类型
      if (!validateFileType(file, allowedTypes)) {
        continue;
      }

      try {
        const content = await parseTextContent(file);
        
        const fileUpload: FileUpload = {
          id: generateUniqueId(),
          file,
          documentId: files.length + newFiles.length + 1,
          page: 1,
          content,
          status: 'completed'
        };

        newFiles.push(fileUpload);
      } catch (error) {
        const fileUpload: FileUpload = {
          id: generateUniqueId(),
          file,
          documentId: files.length + newFiles.length + 1,
          page: 1,
          status: 'error',
          error: '文件读取失败'
        };

        newFiles.push(fileUpload);
      }
    }

    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange, disabled]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/json': ['.json']
    },
    disabled,
    maxFiles: maxFiles - files.length,
    maxSize: 10 * 1024 * 1024 // 10MB
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
              支持 TXT、MD、JSON 格式，最大 10MB
            </p>
            <p className="text-xs text-gray-400 mt-1">
              最多可上传 {maxFiles} 个文件，当前已上传 {files.length} 个
            </p>
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
                  <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      文档 {file.documentId}: {file.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.file.size)}
                      {file.content && ` • ${file.content.length} 字符`}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {file.status === 'completed' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        就绪
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