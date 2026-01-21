import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, File, Image, Video } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  disabled?: boolean;
}

const FileUpload = ({ files, onFilesChange, accept = "*/*", maxFiles = 5, disabled = false }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    const fileArray = Array.from(newFiles);
    const remainingSlots = maxFiles - files.length;
    const filesToAdd = fileArray.slice(0, remainingSlots);
    
    onFilesChange([...files, ...filesToAdd]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Label>Upload Files *</Label>
      
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          dragActive ? 'border-accent bg-accent/5' : 'border-neutral-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-accent'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="py-8 text-center">
          <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-4" />
          <p className="text-sm text-neutral-600 mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-neutral-500">
            {files.length}/{maxFiles} files selected
          </p>
        </CardContent>
      </Card>

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Files:</Label>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={disabled}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;