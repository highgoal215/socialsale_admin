import React, { useRef, useState } from 'react';
import { Button } from './button';
import { Label } from './label';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  id: string;
  label: string;
  accept?: string;
  onFileChange: (file: File | null) => void;
  currentFile?: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  id,
  label,
  accept = "image/*",
  onFileChange,
  currentFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (file: File | null) => {
    onFileChange(file);
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFileChange(file);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const removeFile = () => {
    handleFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex items-center justify-center">
      {label && (
        <Label htmlFor={id} className="block text-sm font-medium text-foreground mb-2">
          {label}
        </Label>
      )}
      
      <div className="w-64"> {/* Reduced width from w-1/2 to w-64 */}
        <div
          className={`relative border-2 border-dashed rounded-lg transition-colors duration-200 ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : currentFile 
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          style={{ height: '256px' }} // Changed to match width (w-64 = 256px)
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            id={id}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
          
          {!currentFile ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop an image here, or
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                className="text-xs"
              >
                Browse Files
              </Button>
            </div>
          ) : (
            // File preview state
            <div className="relative h-full flex items-center justify-center">
              <img
                src={URL.createObjectURL(currentFile)}
                alt="Preview"
                className="h-full w-auto object-contain rounded-lg" // Changed from w-full h-full object-cover to h-full w-auto object-contain
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeFile}
                className="absolute top-2 right-2 w-6 h-6 p-0 rounded-full"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload; 