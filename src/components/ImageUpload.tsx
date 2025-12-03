'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/Button';
import Image from 'next/image';

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
  acceptedTypes?: string[];
  maxSizePerImage?: number; // in MB
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  maxImages = 10,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxSizePerImage = 5
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: File[]): { validFiles: File[], errors: string[] } => {
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    files.forEach((file, index) => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        newErrors.push(`File ${index + 1}: Invalid file type. Please upload ${acceptedTypes.join(', ')}`);
        return;
      }

      // Check file size
      if (file.size > maxSizePerImage * 1024 * 1024) {
        newErrors.push(`File ${index + 1}: File size exceeds ${maxSizePerImage}MB`);
        return;
      }

      validFiles.push(file);
    });

    return { validFiles, errors: newErrors };
  }, [acceptedTypes, maxSizePerImage]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const totalFiles = selectedImages.length + fileArray.length;

    if (totalFiles > maxImages) {
      setErrors([`Maximum ${maxImages} images allowed`]);
      return;
    }

    const { validFiles, errors: validationErrors } = validateFiles(fileArray);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    const newImages = [...selectedImages, ...validFiles];
    setSelectedImages(newImages);
    onImagesChange(newImages);

    // Create previews
    const newPreviews = [...previews];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          setPreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [selectedImages, previews, maxImages, validateFiles, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeImage = useCallback((index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setSelectedImages(newImages);
    setPreviews(newPreviews);
    onImagesChange(newImages);
    setErrors([]);
  }, [selectedImages, previews, onImagesChange]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Product Images
        </label>
        <p className="text-sm text-gray-500">
          Upload up to {maxImages} images. Max size: {maxSizePerImage}MB per image.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`image-upload-area ${dragOver ? 'dragover' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {acceptedTypes.join(', ').toUpperCase()} up to {maxSizePerImage}MB each
            </p>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Selected Images ({selectedImages.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                  {selectedImages[index]?.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add More Button */}
      {selectedImages.length > 0 && selectedImages.length < maxImages && (
        <Button
          type="button"
          variant="secondary"
          onClick={openFileDialog}
          className="w-full"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Add More Images ({selectedImages.length}/{maxImages})
        </Button>
      )}
    </div>
  );
};
