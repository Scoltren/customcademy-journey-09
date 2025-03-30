
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileIcon, UploadIcon, XCircleIcon } from 'lucide-react';

interface FileUploaderProps {
  accept?: string;
  maxSize?: number;
  onChange: (file: File | null) => void;
}

export const FileUploader = ({ accept = '*', maxSize = 100 * 1024 * 1024, onChange }: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      onChange(null);
      return;
    }
    
    // Check file size
    if (selectedFile.size > maxSize) {
      setError(`File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`);
      return;
    }
    
    setFile(selectedFile);
    onChange(selectedFile);
    
    // Generate preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };
  
  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onChange(null);
  };
  
  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center w-full">
        <div className={`
          flex flex-col items-center justify-center w-full
          border-2 border-dashed rounded-lg
          cursor-pointer
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-50'}
          p-6 transition-all duration-200
        `}>
          {!file && (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadIcon className="w-8 h-8 mb-4 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {accept === 'image/*' ? 'PNG, JPG, GIF up to ' : accept === 'video/*' ? 'MP4, MOV, AVI up to ' : 'File up to '}
                {Math.round(maxSize / (1024 * 1024))}MB
              </p>
            </div>
          )}
          
          {file && preview && (
            <div className="relative w-full max-w-md">
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-0 right-0 bg-gray-900 rounded-full p-1 text-white z-10"
              >
                <XCircleIcon size={20} />
              </button>
              <img
                src={preview}
                alt="Preview"
                className="mt-2 rounded-lg max-h-48 mx-auto object-cover"
              />
            </div>
          )}
          
          {file && !preview && (
            <div className="flex items-center space-x-2 mt-2">
              <FileIcon className="w-8 h-8 text-blue-500" />
              <span className="text-sm font-medium">{file.name}</span>
              <button
                type="button"
                onClick={handleClear}
                className="text-red-500 hover:text-red-700"
              >
                <XCircleIcon size={20} />
              </button>
            </div>
          )}
          
          <input
            type="file"
            accept={accept}
            ref={fileInputRef}
            onChange={handleFileChange}
            className={`hidden ${file ? '' : 'absolute inset-0 w-full h-full cursor-pointer opacity-0'}`}
          />
        </div>
        
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        
        {!file && (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4"
          >
            Select File
          </Button>
        )}
      </div>
    </div>
  );
};
